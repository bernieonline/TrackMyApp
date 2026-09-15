// crypto-ui.js — Passphrase dialog controller
// Passphrase is held in memory only, never written to storage.

let _sessionPassphrase = null;

function getPassphrase() {
  return _sessionPassphrase;
}

function clearPassphrase() {
  _sessionPassphrase = null;
  updateLockIndicator();
}

function isUnlocked() {
  return _sessionPassphrase !== null;
}

/**
 * Show the passphrase dialog.
 * mode: "setup" (first use — enter + confirm)
 *       "unlock" (returning — single field)
 *       "change" (rotation — old + new + confirm)
 * Returns a Promise that resolves when the user submits, rejects on cancel.
 */
function showPassphraseDialog(mode) {
  const dialog = document.getElementById("passphrase-dialog");
  const title = document.getElementById("passphrase-title");
  const form = document.getElementById("passphrase-form");
  const errorEl = document.getElementById("passphrase-error");

  const fieldOld = document.getElementById("passphrase-old-group");
  const fieldNew = document.getElementById("passphrase-new-group");
  const fieldConfirm = document.getElementById("passphrase-confirm-group");

  const inputOld = document.getElementById("passphrase-old");
  const inputNew = document.getElementById("passphrase-new");
  const inputConfirm = document.getElementById("passphrase-confirm");

  // Reset
  inputOld.value = "";
  inputNew.value = "";
  inputConfirm.value = "";
  errorEl.textContent = "";
  errorEl.hidden = true;

  // Configure fields for mode
  if (mode === "setup") {
    title.textContent = "Set Passphrase";
    fieldOld.hidden = true;
    fieldNew.hidden = false;
    fieldConfirm.hidden = false;
    inputNew.placeholder = "Enter passphrase";
  } else if (mode === "unlock") {
    title.textContent = "Enter Passphrase";
    fieldOld.hidden = true;
    fieldNew.hidden = false;
    fieldConfirm.hidden = true;
    inputNew.placeholder = "Enter passphrase";
  } else if (mode === "change") {
    title.textContent = "Change Passphrase";
    fieldOld.hidden = false;
    fieldNew.hidden = false;
    fieldConfirm.hidden = false;
    inputNew.placeholder = "New passphrase";
  }

  dialog.classList.add("open");

  // Focus the first visible input
  if (!fieldOld.hidden) {
    inputOld.focus();
  } else {
    inputNew.focus();
  }

  return new Promise((resolve, reject) => {
    function onSubmit(e) {
      e.preventDefault();
      errorEl.hidden = true;

      if (mode === "setup") {
        const pass = inputNew.value;
        const confirm = inputConfirm.value;
        if (pass.length < 4) {
          showError("Passphrase must be at least 4 characters");
          return;
        }
        if (pass !== confirm) {
          showError("Passphrases do not match");
          return;
        }
        _sessionPassphrase = pass;
        cleanup();
        resolve({ passphrase: pass });

      } else if (mode === "unlock") {
        const pass = inputNew.value;
        if (!pass) {
          showError("Please enter your passphrase");
          return;
        }
        _sessionPassphrase = pass;
        cleanup();
        resolve({ passphrase: pass });

      } else if (mode === "change") {
        const oldPass = inputOld.value;
        const newPass = inputNew.value;
        const confirm = inputConfirm.value;
        if (!oldPass) {
          showError("Please enter your current passphrase");
          return;
        }
        if (newPass.length < 4) {
          showError("New passphrase must be at least 4 characters");
          return;
        }
        if (newPass !== confirm) {
          showError("New passphrases do not match");
          return;
        }
        cleanup();
        resolve({ oldPassphrase: oldPass, newPassphrase: newPass });
      }
    }

    function onCancel() {
      cleanup();
      reject(new Error("Cancelled"));
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }

    function cleanup() {
      form.removeEventListener("submit", onSubmit);
      document.getElementById("btn-passphrase-cancel").removeEventListener("click", onCancel);
      dialog.classList.remove("open");
      updateLockIndicator();
    }

    form.addEventListener("submit", onSubmit);
    document.getElementById("btn-passphrase-cancel").addEventListener("click", onCancel);
  });
}

function updateLockIndicator() {
  const indicator = document.getElementById("lock-indicator");
  if (!indicator) return;
  if (isUnlocked()) {
    indicator.textContent = "Unlocked";
    indicator.className = "lock-indicator unlocked";
  } else {
    indicator.textContent = "Locked";
    indicator.className = "lock-indicator locked";
  }
}
