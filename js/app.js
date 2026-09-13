// app.js — UI rendering, event handlers, edit mode

let editMode = false;
let selectedMonth;
let selectedYear;

// ── Initialise ──
document.addEventListener("DOMContentLoaded", () => {
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

    if (!isIndex) {
      const currSymbol = document.createElement("span");
      currSymbol.className = "currency-symbol";
      currSymbol.textContent = "£";
      tdValue.appendChild(currSymbol);
    }

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

    tdValue.appendChild(valueInput);
    tr.appendChild(tdValue);

    tbody.appendChild(tr);
  });

  renderTotals();
  renderComment();
}

// ── Totals ──
function renderTotals() {
  const yearMonth = formatYearMonth(selectedYear, selectedMonth);
  const entry = getEntry(yearMonth);
  const activeProviders = getActiveProviders();

  let savingTotal = 0;
  let investmentTotal = 0;
  let pensionTotal = 0;

  activeProviders.forEach(p => {
    const val = entry.values[p.id];
    if (val === undefined) return;
    switch (p.category) {
      case "Saving":     savingTotal += val; break;
      case "Investment": investmentTotal += val; break;
      case "Pension":    pensionTotal += val; break;
      // Index excluded from all totals
    }
  });

  const savingsInvestments = savingTotal + investmentTotal;
  const grandTotal = savingTotal + investmentTotal + pensionTotal;

  const rows = [
    { label: "Savings + Investments", value: savingsInvestments, cat: "saving-investment" },
    { label: "Savings only",         value: savingTotal,         cat: "Saving" },
    { label: "Investments only",     value: investmentTotal,     cat: "Investment" },
    { label: "Pension",              value: pensionTotal,        cat: "Pension" },
    { label: "Grand Total",          value: grandTotal,          cat: "grand-total" },
  ];

  const section = document.getElementById("totals-section");
  section.innerHTML = rows.map(r =>
    `<div class="totals-row totals-${r.cat}">` +
      `<span class="totals-label">${r.label}</span>` +
      `<span class="totals-value">£${formatNumber(r.value)}</span>` +
    `</div>`
  ).join("");
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
