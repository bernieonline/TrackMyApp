// crypto.js — Client-side encryption module (Web Crypto API, AES-256-GCM)
// No plaintext data ever leaves the browser.

const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;  // bytes
const IV_LENGTH = 12;    // bytes (AES-GCM standard)

/**
 * Generate a random salt.
 */
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive an AES-256-GCM key from a passphrase and salt using PBKDF2.
 * Returns a CryptoKey.
 */
async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a JavaScript object into a base64 bundle.
 * Bundle layout: [16 bytes salt][12 bytes IV][N bytes ciphertext]
 * Returns a base64 string.
 */
async function encryptData(dataObject, passphrase) {
  const salt = generateSalt();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(dataObject));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    plaintext
  );

  // Pack salt + IV + ciphertext into a single Uint8Array
  const ciphertextArray = new Uint8Array(ciphertext);
  const bundle = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertextArray.length);
  bundle.set(salt, 0);
  bundle.set(iv, SALT_LENGTH);
  bundle.set(ciphertextArray, SALT_LENGTH + IV_LENGTH);

  return uint8ArrayToBase64(bundle);
}

/**
 * Decrypt a base64 bundle back into a JavaScript object.
 * Throws on wrong passphrase or corrupted data.
 */
async function decryptData(base64Bundle, passphrase) {
  const bundle = base64ToUint8Array(base64Bundle);

  if (bundle.length < SALT_LENGTH + IV_LENGTH + 1) {
    throw new Error("Invalid encrypted data: too short");
  }

  const salt = bundle.slice(0, SALT_LENGTH);
  const iv = bundle.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = bundle.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  let plaintext;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
  } catch (e) {
    throw new Error("Decryption failed — wrong passphrase or corrupted data");
  }

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext));
}

/**
 * Re-encrypt a bundle with a new passphrase (passphrase rotation, Spec 11d).
 * Decrypts with oldPassphrase, re-encrypts with newPassphrase.
 * Returns a new base64 bundle.
 */
async function changePassphrase(base64Bundle, oldPassphrase, newPassphrase) {
  const data = await decryptData(base64Bundle, oldPassphrase);
  return encryptData(data, newPassphrase);
}

// ── Base64 helpers ──

function uint8ArrayToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
