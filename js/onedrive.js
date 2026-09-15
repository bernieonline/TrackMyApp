// onedrive.js — MSAL.js authentication + OneDrive Graph API read/write

const ONEDRIVE_FOLDER = "MyBGAccounts";
const ONEDRIVE_FILE_NAME = "mybgaccounts.dat";
const ONEDRIVE_FILE_PATH = ONEDRIVE_FOLDER + "/" + ONEDRIVE_FILE_NAME;
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// MSAL configuration — clientId from Azure App Registration
const msalConfig = {
  auth: {
    clientId: "f388e9f8-d1d5-4623-a9ce-4d92aff9403e",
    authority: "https://login.microsoftonline.com/consumers", // personal MS accounts only
    redirectUri: window.location.origin + window.location.pathname,
  },
  cache: {
    cacheLocation: "sessionStorage", // cleared when tab closes
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: ["Files.ReadWrite", "User.Read"],
};

let msalInstance = null;
let msalAccount = null;
let _lastETag = null; // ETag of the file when last loaded

// ── Initialise MSAL ──

async function initMsal() {
  msalInstance = new msal.PublicClientApplication(msalConfig);
  await msalInstance.initialize();
}

// ── Sign in / out ──

async function signIn() {
  try {
    const response = await msalInstance.loginPopup(loginRequest);
    msalAccount = response.account;
    updateAuthUI();
    return msalAccount;
  } catch (err) {
    if (err.errorCode === "user_cancelled") {
      return null; // user closed popup
    }
    console.error("Sign-in failed:", err);
    alert("Sign-in failed: " + err.message);
    return null;
  }
}

function signOut() {
  msalInstance.logoutPopup({ account: msalAccount });
  msalAccount = null;
  _lastETag = null;
  clearPassphrase();
  updateAuthUI();
}

function isSignedIn() {
  return msalAccount !== null;
}

function getSignedInUserName() {
  return msalAccount ? (msalAccount.name || msalAccount.username) : null;
}

// ── Token acquisition (silent with popup fallback) ──

async function getAccessToken() {
  if (!msalAccount) throw new Error("Not signed in");

  const tokenRequest = {
    scopes: loginRequest.scopes,
    account: msalAccount,
  };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (err) {
    console.warn("Silent token failed, using popup:", err);
    const response = await msalInstance.acquireTokenPopup(tokenRequest);
    msalAccount = response.account;
    return response.accessToken;
  }
}

// ── Graph API helper ──

async function graphFetch(url, options = {}) {
  const token = await getAccessToken();
  const headers = {
    "Authorization": "Bearer " + token,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

// ── Download encrypted file from OneDrive ──

async function downloadFromOneDrive() {
  const metaUrl = GRAPH_BASE + "/me/drive/root:/" +
    ONEDRIVE_FILE_PATH;

  const metaResponse = await graphFetch(metaUrl);

  if (metaResponse.status === 404) {
    // File does not exist yet — first run
    _lastETag = null;
    return null;
  }

  if (!metaResponse.ok) {
    throw new Error("Failed to get file metadata: " + metaResponse.status);
  }

  const meta = await metaResponse.json();
  _lastETag = meta.eTag;

  // Download the actual content
  const downloadUrl = meta["@microsoft.graph.downloadUrl"];
  const contentResponse = await fetch(downloadUrl);

  if (!contentResponse.ok) {
    throw new Error("Failed to download file: " + contentResponse.status);
  }

  return await contentResponse.text(); // base64 encrypted bundle
}

// ── Upload encrypted file to OneDrive (with ETag conflict check) ──

async function uploadToOneDrive(encryptedBundle) {
  const uploadUrl = GRAPH_BASE + "/me/drive/root:/" +
    ONEDRIVE_FILE_PATH + ":/content";

  const headers = {
    "Content-Type": "text/plain",
  };

  // ETag conflict detection (Spec 11a)
  if (_lastETag) {
    headers["If-Match"] = _lastETag;
  }

  const response = await graphFetch(uploadUrl, {
    method: "PUT",
    headers: headers,
    body: encryptedBundle,
  });

  if (response.status === 412) {
    throw new ETagConflictError(
      "The data file has been modified by another device since you loaded it. " +
      "Please reload to get the latest version before saving."
    );
  }

  if (!response.ok) {
    throw new Error("Failed to upload file: " + response.status);
  }

  // Update stored ETag to the new version
  const meta = await response.json();
  _lastETag = meta.eTag;
  return meta;
}

// ── ETag conflict error ──

class ETagConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ETagConflictError";
  }
}

// ── Auth UI update ──

function updateAuthUI() {
  const signInBtn = document.getElementById("btn-signin");
  const signOutBtn = document.getElementById("btn-signout");
  const userDisplay = document.getElementById("user-display");

  if (isSignedIn()) {
    if (signInBtn) signInBtn.hidden = true;
    if (signOutBtn) signOutBtn.hidden = false;
    if (userDisplay) userDisplay.textContent = getSignedInUserName() || "";
  } else {
    if (signInBtn) signInBtn.hidden = false;
    if (signOutBtn) signOutBtn.hidden = true;
    if (userDisplay) userDisplay.textContent = "";
  }
}
