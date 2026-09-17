// review.js — Review/history view + spreadsheet pivot table

let reviewMonth = null; // current YYYY-MM being reviewed

// ── Review mode rendering ──

function initReview() {
  const months = getMonthsWithData();
  if (months.length === 0) {
    reviewMonth = formatYearMonth(new Date().getFullYear(), new Date().getMonth() + 1);
  } else {
    reviewMonth = months[months.length - 1]; // latest month with data
  }
  renderReview();
}

function stepMonth(direction) {
  if (direction === -1) {
    reviewMonth = getPreviousMonth(reviewMonth);
  } else {
    reviewMonth = getNextMonth(reviewMonth);
  }
  renderReview();
}

function renderReview() {
  // Month label and navigation
  document.getElementById("review-month-label").textContent = formatMonthLabel(reviewMonth);

  const entry = entries[reviewMonth];
  const allProviders = getAllProviders();

  // Build read-only table — only providers with non-zero values
  const tbody = document.getElementById("review-tbody");
  tbody.innerHTML = "";

  if (!entry || Object.keys(entry.values).length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#666;padding:20px">No data for this month</td></tr>';
  } else {
    // Get providers with values, sorted by category order
    const providersWithValues = allProviders.filter(p => {
      const val = entry.values[p.id];
      return val !== undefined && val !== 0;
    });

    providersWithValues.forEach(provider => {
      const val = entry.values[provider.id];
      const tr = document.createElement("tr");

      // Provider label with category dot
      const tdLabel = document.createElement("td");
      tdLabel.className = "provider-label";
      const dot = document.createElement("span");
      dot.className = `category-dot ${provider.category}`;
      tdLabel.appendChild(dot);
      tdLabel.appendChild(document.createTextNode(provider.label));
      tr.appendChild(tdLabel);

      // Value (read-only) + net change
      const tdValue = document.createElement("td");
      tdValue.className = "value-cell";
      const isIndex = provider.category === "Index";

      // Net change vs prior month (before value for alignment)
      const priorYM = getPreviousMonth(reviewMonth);
      const priorEntry = entries[priorYM];
      const priorVal = priorEntry ? (priorEntry.values[provider.id] || 0) : 0;
      const deltaSpan = document.createElement("span");
      deltaSpan.className = "net-change";
      if (priorVal > 0 && val > 0) {
        const delta = val - priorVal;
        deltaSpan.style.color = delta >= 0 ? "var(--cat-saving)" : "var(--colour-danger)";
        const arrow = delta >= 0 ? "\u25B2" : "\u25BC";
        const pfx = isIndex ? "" : "\u00A3";
        deltaSpan.textContent = `${arrow} ${pfx}${Math.abs(delta).toLocaleString("en-GB", {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
      }
      tdValue.appendChild(deltaSpan);

      // £ and value
      const prefix = isIndex ? "" : "\u00A3";
      const valueSpan = document.createElement("span");
      valueSpan.textContent = prefix + formatNumber(val);
      tdValue.appendChild(valueSpan);

      tr.appendChild(tdValue);

      // Chart icon
      const tdChart = document.createElement("td");
      tdChart.className = "chart-icon-cell";
      tdChart.innerHTML = '<span class="chart-icon" title="View chart">\u{1F4C8}</span>';
      tdChart.addEventListener("click", () => jumpToReports(provider.id));
      tr.appendChild(tdChart);

      tbody.appendChild(tr);
    });
  }

  // Totals
  renderReviewTotals();

  // Comment
  const commentEl = document.getElementById("review-comment");
  const commentText = entry ? entry.comment : "";
  if (commentText) {
    commentEl.textContent = commentText;
    commentEl.parentElement.hidden = false;
  } else {
    commentEl.parentElement.hidden = true;
  }

  // 3-month summary
  renderSummaryTable();
}

function renderReviewTotals() {
  const t = calculateTotalsForMonth(reviewMonth);

  const rows = [
    { label: "Savings + Investments", value: t.savingsInvestments, cat: "saving-investment" },
    { label: "Savings only",         value: t.saving,              cat: "Saving" },
    { label: "Investments only",     value: t.investment,           cat: "Investment" },
    { label: "Pension",              value: t.pension,              cat: "Pension" },
    { label: "Grand Total",          value: t.grandTotal,           cat: "grand-total" },
  ];

  const totalsKeys = ["total-si", "total-s", "total-i", "total-p", "total-grand"];

  const section = document.getElementById("review-totals");
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

// ── 3-month summary table ──

function renderSummaryTable() {
  const months = getMonthRange(reviewMonth, 3);

  // Calculate totals for each month
  const monthTotals = months.map(ym => {
    const t = calculateTotalsForMonth(ym);
    return {
      yearMonth: ym,
      label: formatMonthLabel(ym),
      shortLabel: formatShortMonth(ym),
      savingsInvestments: t.savingsInvestments,
      saving: t.saving,
      investment: t.investment,
      pension: t.pension,
      grandTotal: t.grandTotal,
    };
  });

  const table = document.getElementById("summary-table");
  const categories = [
    { key: "savingsInvestments", label: "S+I Total" },
    { key: "saving",            label: "Savings" },
    { key: "investment",        label: "Investments" },
    { key: "pension",           label: "Pension" },
    { key: "grandTotal",        label: "Grand Total" },
  ];

  let html = "<thead><tr><th></th>";
  monthTotals.forEach(mt => {
    html += `<th>${mt.shortLabel}</th>`;
  });
  html += "</tr></thead><tbody>";

  categories.forEach(cat => {
    html += `<tr><td class="summary-label">${cat.label}</td>`;
    monthTotals.forEach(mt => {
      html += `<td class="summary-value">£${formatNumber(mt[cat.key])}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody>";
  table.innerHTML = html;
}

// ── Spreadsheet / pivot view ──

function renderSpreadsheet() {
  const months = getMonthsWithData();
  if (months.length === 0) {
    document.getElementById("spreadsheet-table").innerHTML =
      '<tr><td style="padding:20px;text-align:center;color:#666">No data to display</td></tr>';
    return;
  }

  // Get last 12 months ending at the latest month with data
  const latestMonth = months[months.length - 1];
  const displayMonths = getMonthRange(latestMonth, 12);

  // Find all providers that had any value in any of these months
  const allProviders = getAllProviders();
  const activeProviderIds = new Set();

  displayMonths.forEach(ym => {
    const entry = entries[ym];
    if (!entry) return;
    Object.keys(entry.values).forEach(id => {
      if (entry.values[id] !== undefined && entry.values[id] !== 0) {
        activeProviderIds.add(parseInt(id));
      }
    });
  });

  const displayProviders = allProviders.filter(p => activeProviderIds.has(p.id));

  // Build table
  let html = "<thead><tr><th class='spreadsheet-provider'>Provider</th>";
  displayMonths.forEach(ym => {
    html += `<th class="spreadsheet-month">${formatShortMonth(ym)}</th>`;
  });
  html += "</tr></thead><tbody>";

  // Provider rows
  displayProviders.forEach(p => {
    html += `<tr><td class="spreadsheet-provider">`;
    html += `<span class="category-dot ${p.category}"></span>`;
    html += `${p.label}</td>`;

    displayMonths.forEach(ym => {
      const entry = entries[ym];
      const val = entry ? (entry.values[p.id] || 0) : 0;
      const isIndex = p.category === "Index";
      const prefix = isIndex ? "" : "£";
      const cls = val === 0 ? "spreadsheet-zero" : "";
      html += `<td class="spreadsheet-value ${cls}">${prefix}${formatNumber(val)}</td>`;
    });
    html += "</tr>";
  });

  // Totals rows
  const totalsCategories = [
    { label: "S+I Total", filter: p => p.category === "Saving" || p.category === "Investment" },
    { label: "Savings",   filter: p => p.category === "Saving" },
    { label: "Investments", filter: p => p.category === "Investment" },
    { label: "Pension",   filter: p => p.category === "Pension" },
    { label: "Grand Total", filter: p => ["Saving", "Investment", "Pension"].includes(p.category) },
  ];

  totalsCategories.forEach(cat => {
    html += `<tr class="spreadsheet-totals"><td class="spreadsheet-provider"><strong>${cat.label}</strong></td>`;
    displayMonths.forEach(ym => {
      const entry = entries[ym];
      let total = 0;
      if (entry) {
        allProviders.filter(cat.filter).forEach(p => {
          total += entry.values[p.id] || 0;
        });
      }
      html += `<td class="spreadsheet-value"><strong>£${formatNumber(total)}</strong></td>`;
    });
    html += "</tr>";
  });

  html += "</tbody>";
  document.getElementById("spreadsheet-table").innerHTML = html;
}

// ── Helpers ──

function formatShortMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  const shortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return shortNames[m - 1] + " " + String(y).slice(2);
}
