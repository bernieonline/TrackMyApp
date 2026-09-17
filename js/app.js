// app.js — UI rendering, event handlers, edit mode, OneDrive flows

let editMode = false;
let selectedMonth;
let selectedYear;
let currentView = "entry"; // "entry" or "review"

// ── Status overlay helpers ──
function showStatus(message) {
  document.getElementById("status-message").textContent = message;
  document.getElementById("status-overlay").hidden = false;
}

function hideStatus() {
  document.getElementById("status-overlay").hidden = true;
}

// ── Initialise ──
document.addEventListener("DOMContentLoaded", async () => {
  await initMsal(); // Initialise MSAL client (must complete before sign-in works)

  loadDraft(); // Restore providers and entries from localStorage

  const def = getDefaultDate();
  selectedMonth = def.month;
  selectedYear = def.year;

  populateSelectors();
  render();

  // Event listeners
  document.getElementById("month-select").addEventListener("change", onDateChange);
  document.getElementById("year-select").addEventListener("change", onDateChange);
  document.getElementById("btn-edit").addEventListener("click", toggleEditMode);
  document.getElementById("btn-add").addEventListener("click", openAddDialog);
  document.getElementById("btn-add-cancel").addEventListener("click", closeAddDialog);
  document.getElementById("add-form").addEventListener("submit", onAddProvider);
  document.getElementById("comment-box").addEventListener("input", onCommentInput);
  document.getElementById("btn-passphrase").addEventListener("click", onPassphraseButton);
  document.getElementById("btn-signin").addEventListener("click", onSignIn);
  document.getElementById("btn-signout").addEventListener("click", onSignOut);
  document.getElementById("btn-save").addEventListener("click", onSave);
  document.getElementById("btn-export").addEventListener("click", onExport);

  // View toggle
  document.getElementById("btn-view-entry").addEventListener("click", () => switchView("entry"));
  document.getElementById("btn-view-review").addEventListener("click", () => switchView("review"));
  document.getElementById("btn-view-reports").addEventListener("click", () => switchView("reports"));

  // Review navigation
  document.getElementById("btn-prev-month").addEventListener("click", () => stepMonth(-1));
  document.getElementById("btn-next-month").addEventListener("click", () => stepMonth(1));
  document.getElementById("btn-spreadsheet").addEventListener("click", openSpreadsheet);
  document.getElementById("btn-close-spreadsheet").addEventListener("click", closeSpreadsheet);

  updateLockIndicator();
  updateAuthUI();
});

// ── Selectors ──
function populateSelectors() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthSelect.innerHTML = "";
  monthNames.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = name;
    if (i + 1 === selectedMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  });

  yearSelect.innerHTML = "";
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === selectedYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }
}

function onDateChange() {
  selectedMonth = parseInt(document.getElementById("month-select").value);
  selectedYear = parseInt(document.getElementById("year-select").value);
  render();
}

// ── Edit mode ──
function toggleEditMode() {
  editMode = !editMode;
  document.getElementById("btn-edit").classList.toggle("active", editMode);
  document.getElementById("btn-edit").textContent = editMode ? "Done" : "Edit";
  render();
}

// ── Render ──
function render() {
  const yearMonth = formatYearMonth(selectedYear, selectedMonth);
  const entry = getEntry(yearMonth);
  const providerList = editMode ? getAllProviders() : getActiveProviders();

  const tbody = document.getElementById("provider-tbody");
  const thead = document.getElementById("provider-thead");

  // Header row
  let headerHtml = "<tr>";
  if (editMode) headerHtml += '<th style="width:50px">Active</th>';
  headerHtml += "<th>Provider</th>";
  if (editMode) headerHtml += "<th>Category</th>";
  headerHtml += '<th style="text-align:right">Value</th>';
  headerHtml += '<th style="width:40px"></th>';
  headerHtml += "</tr>";
  thead.innerHTML = headerHtml;

  // Body rows
  tbody.innerHTML = "";
  providerList.forEach((provider, index) => {
    const tr = document.createElement("tr");
    if (editMode && !provider.active) tr.classList.add("inactive-row");

    // Active checkbox (edit mode only)
    if (editMode) {
      const tdActive = document.createElement("td");
      tdActive.className = "active-cell";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "active-checkbox";
      cb.checked = provider.active;
      cb.addEventListener("change", () => {
        toggleProviderActive(provider.id);
        tr.classList.toggle("inactive-row", !provider.active);
        saveDraft();
      });
      tdActive.appendChild(cb);
      tr.appendChild(tdActive);
    }

    // Provider label
    const tdLabel = document.createElement("td");
    tdLabel.className = "provider-label";

    const dot = document.createElement("span");
    dot.className = `category-dot ${provider.category}`;
    tdLabel.appendChild(dot);

    if (editMode) {
      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.className = "label-input";
      labelInput.value = provider.label;
      labelInput.addEventListener("change", (e) => {
        updateProviderLabel(provider.id, e.target.value);
        saveDraft();
      });
      tdLabel.appendChild(labelInput);
    } else {
      tdLabel.appendChild(document.createTextNode(provider.label));
    }
    tr.appendChild(tdLabel);

    // Category (edit mode only)
    if (editMode) {
      const tdCat = document.createElement("td");
      const catLabel = document.createElement("span");
      catLabel.className = "category-label";
      catLabel.textContent = provider.category;
      tdCat.appendChild(catLabel);
      tr.appendChild(tdCat);
    }

    // Value input
    const tdValue = document.createElement("td");
    tdValue.className = "value-cell";

    const isIndex = provider.category === "Index";

    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.className = "value-input";
    valueInput.step = "0.01";
    valueInput.placeholder = "0.00";
    valueInput.dataset.providerId = provider.id;

    const currentValue = entry.values[provider.id];
    if (currentValue !== undefined) {
      valueInput.value = currentValue.toFixed(2);
    }

    valueInput.addEventListener("change", (e) => {
      const raw = e.target.value.trim();
      if (raw === "") {
        setProviderValue(yearMonth, provider.id, "");
        renderTotals();
        saveDraft();
        return;
      }
      const num = parseFloat(raw);
      if (isNaN(num)) {
        e.target.value = "";
        setProviderValue(yearMonth, provider.id, "");
        renderTotals();
        saveDraft();
        return;
      }
      const rounded = Math.round(num * 100) / 100;
      e.target.value = rounded.toFixed(2);
      setProviderValue(yearMonth, provider.id, rounded);
      renderTotals();
      saveDraft();
    });

    // Tab/Enter navigation
    valueInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextValueInput(valueInput);
      }
    });

    // Net change vs prior month (inserted before input for alignment)
    const priorYM = getPreviousMonth(yearMonth);
    const priorEntry = entries[priorYM];
    const priorVal = priorEntry ? (priorEntry.values[provider.id] || 0) : 0;
    const curVal = entry.values[provider.id] || 0;
    const deltaSpan = document.createElement("span");
    deltaSpan.className = "net-change";
    if (priorVal > 0 && curVal > 0) {
      const delta = curVal - priorVal;
      deltaSpan.style.color = delta >= 0 ? "var(--cat-saving)" : "var(--colour-danger)";
      const arrow = delta >= 0 ? "\u25B2" : "\u25BC";
      const isIdx = provider.category === "Index";
      const prefix = isIdx ? "" : "\u00A3";
      deltaSpan.textContent = `${arrow} ${prefix}${Math.abs(delta).toLocaleString("en-GB", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    }
    tdValue.appendChild(deltaSpan);

    if (!isIndex) {
      const currSymbol = document.createElement("span");
      currSymbol.className = "currency-symbol";
      currSymbol.textContent = "£";
      tdValue.appendChild(currSymbol);
    }

    tdValue.appendChild(valueInput);

    tr.appendChild(tdValue);

    // Chart icon
    const tdChart = document.createElement("td");
    tdChart.className = "chart-icon-cell";
    tdChart.innerHTML = '<span class="chart-icon" title="View chart">\u{1F4C8}</span>';
    tdChart.addEventListener("click", () => jumpToReports(provider.id));
    tr.appendChild(tdChart);

    tbody.appendChild(tr);
  });

  renderTotals();
  renderComment();
}

// ── Totals ──
function renderTotals() {
  const yearMonth = formatYearMonth(selectedYear, selectedMonth);
  const t = calculateTotalsForMonth(yearMonth);

  const rows = [
    { label: "Savings + Investments", value: t.savingsInvestments, cat: "saving-investment" },
    { label: "Savings only",         value: t.saving,              cat: "Saving" },
    { label: "Investments only",     value: t.investment,           cat: "Investment" },
    { label: "Pension",              value: t.pension,              cat: "Pension" },
    { label: "Grand Total",          value: t.grandTotal,           cat: "grand-total" },
  ];

  const totalsKeys = ["total-si", "total-s", "total-i", "total-p", "total-grand"];

  const section = document.getElementById("totals-section");
  section.innerHTML = rows.map((r, i) =>
    `<div class="totals-row totals-${r.cat}">` +
      `<span class="totals-label">${r.label}</span>` +
      `<span class="totals-value">\u00A3${formatNumber(r.value)}</span>` +
      `<span class="chart-icon totals-chart-icon" data-row="${totalsKeys[i]}" title="View chart">\u{1F4C8}</span>` +
    `</div>`
  ).join("");

  section.querySelectorAll(".totals-chart-icon").forEach(icon => {
    icon.addEventListener("click", () => jumpToReports(icon.dataset.row));
  });
}

function formatNumber(n) {
  return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Comments ──
function renderComment() {
  const yearMonth = formatYearMonth(selectedYear, selectedMonth);
  const entry = getEntry(yearMonth);
  document.getElementById("comment-box").value = entry.comment;
}

function onCommentInput(e) {
  const yearMonth = formatYearMonth(selectedYear, selectedMonth);
  setComment(yearMonth, e.target.value);
  saveDraft();
}

// ── Tab/Enter navigation ──
function focusNextValueInput(currentInput) {
  const inputs = Array.from(document.querySelectorAll(".value-input"));
  const idx = inputs.indexOf(currentInput);
  if (idx >= 0 && idx < inputs.length - 1) {
    inputs[idx + 1].focus();
    inputs[idx + 1].select();
  }
}

// ── Add provider dialog ──
function openAddDialog() {
  document.getElementById("add-dialog").classList.add("open");
  document.getElementById("add-label").value = "";
  document.getElementById("add-category").value = "Saving";
  document.getElementById("add-label").focus();
}

function closeAddDialog() {
  document.getElementById("add-dialog").classList.remove("open");
}

function onAddProvider(e) {
  e.preventDefault();
  const label = document.getElementById("add-label").value.trim();
  const category = document.getElementById("add-category").value;

  if (!label) return;

  addProvider(label, category);
  closeAddDialog();
  render();
  saveDraft();
}

// ── Sign In (Microsoft + OneDrive load) ──
async function onSignIn() {
  const account = await signIn();
  if (!account) return; // user cancelled popup

  showStatus("Loading from OneDrive...");

  try {
    const encryptedBundle = await downloadFromOneDrive();

    if (encryptedBundle === null) {
      // First run — no file on OneDrive yet
      hideStatus();
      let result;
      try {
        result = await showPassphraseDialog("setup");
      } catch (e) {
        return; // cancelled
      }

      showStatus("Creating data file on OneDrive...");
      const data = getExportData();
      const bundle = await encryptData(data, result.passphrase);
      await uploadToOneDrive(bundle);
      saveDraft();
      hideStatus();
      alert("Data file created on OneDrive.");
      render();
    } else {
      // File exists — prompt for passphrase to decrypt
      hideStatus();
      let result;
      try {
        result = await showPassphraseDialog("unlock");
      } catch (e) {
        return; // cancelled
      }

      showStatus("Decrypting...");
      let data;
      try {
        data = await decryptData(encryptedBundle, result.passphrase);
      } catch (err) {
        hideStatus();
        clearPassphrase();
        alert("Decryption failed — wrong passphrase or corrupted data.");
        return;
      }

      importData(data);
      saveDraft(); // keep localStorage in sync

      // Recalculate default date and re-render
      const def = getDefaultDate();
      selectedMonth = def.month;
      selectedYear = def.year;
      populateSelectors();
      render();
      hideStatus();
    }
  } catch (err) {
    hideStatus();
    console.error("OneDrive load failed:", err);
    alert("Failed to load from OneDrive: " + err.message);
  }
}

// ── Sign Out ──
function onSignOut() {
  if (!confirm("Sign out? Any unsaved changes will remain in your local draft.")) {
    return;
  }
  signOut();
}

// ── Save to OneDrive ──
async function onSave() {
  if (!isSignedIn()) {
    alert("Please sign in to Microsoft first.");
    return;
  }
  if (!isUnlocked()) {
    alert("Please enter your passphrase first.");
    return;
  }

  showStatus("Saving to OneDrive...");

  try {
    const data = getExportData();
    const bundle = await encryptData(data, getPassphrase());
    await uploadToOneDrive(bundle);
    saveDraft(); // keep localStorage in sync
    hideStatus();

    // Brief success feedback
    const btn = document.getElementById("btn-save");
    btn.textContent = "Saved";
    btn.classList.add("btn-saved");
    setTimeout(() => {
      btn.textContent = "Save";
      btn.classList.remove("btn-saved");
    }, 2000);

  } catch (err) {
    hideStatus();
    if (err instanceof ETagConflictError) {
      alert(err.message);
    } else {
      console.error("Save failed:", err);
      alert("Save failed: " + err.message);
    }
  }
}

// ── Export decrypted data (Spec 11c) ──
function onExport() {
  if (!isUnlocked()) {
    showPassphraseDialog("unlock")
      .then(() => doExport())
      .catch(() => { /* cancelled */ });
    return;
  }
  doExport();
}

function doExport() {
  const data = getExportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mybgaccounts-export-" + today + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Passphrase button ──
async function onPassphraseButton() {
  if (isUnlocked()) {
    // Already unlocked — offer to change passphrase
    let result;
    try {
      result = await showPassphraseDialog("change");
    } catch (e) {
      return; // cancelled
    }

    const { oldPassphrase, newPassphrase } = result;

    // If signed in and file exists on OneDrive, do a full rotation
    if (isSignedIn() && _lastETag) {
      showStatus("Changing passphrase...");
      try {
        const latestBundle = await downloadFromOneDrive();
        const newBundle = await changePassphrase(latestBundle, oldPassphrase, newPassphrase);
        await uploadToOneDrive(newBundle);
        _sessionPassphrase = newPassphrase;
        updateLockIndicator();
        hideStatus();
        alert("Passphrase changed and saved to OneDrive.");
      } catch (err) {
        hideStatus();
        if (err instanceof ETagConflictError) {
          alert(err.message);
        } else {
          alert("Passphrase change failed: " + err.message);
        }
      }
    } else {
      // Not connected to OneDrive — just update session passphrase
      _sessionPassphrase = newPassphrase;
      updateLockIndicator();
      alert("Session passphrase updated. Save to OneDrive to persist the change.");
    }
  } else {
    // Not yet unlocked — set up or unlock
    try {
      await showPassphraseDialog("setup");
      updateLockIndicator();
    } catch (e) {
      // cancelled
    }
  }
}

// ── View switching ──
function switchView(view) {
  currentView = view;

  document.getElementById("entry-view").hidden = (view !== "entry");
  document.getElementById("review-view").hidden = (view !== "review");
  document.getElementById("reports-view").hidden = (view !== "reports");

  document.getElementById("btn-view-entry").classList.toggle("active", view === "entry");
  document.getElementById("btn-view-review").classList.toggle("active", view === "review");
  document.getElementById("btn-view-reports").classList.toggle("active", view === "reports");

  if (view === "review") initReview();
  if (view === "reports") {
    // Defer chart init to next frame so the container is visible and
    // Chart.js can measure its actual dimensions.
    requestAnimationFrame(() => initReports());
  }
}

function openSpreadsheet() {
  document.getElementById("spreadsheet-section").hidden = false;
  document.getElementById("btn-spreadsheet").hidden = true;
  document.getElementById("btn-close-spreadsheet").hidden = false;
  renderSpreadsheet();
}

function closeSpreadsheet() {
  document.getElementById("spreadsheet-section").hidden = true;
  document.getElementById("btn-spreadsheet").hidden = false;
  document.getElementById("btn-close-spreadsheet").hidden = true;
}
