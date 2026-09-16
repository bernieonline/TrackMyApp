// charts.js — Reports view: trend charts, growth rates, pies, analytics

let reportsSelectedRow = null;   // provider id (number) or totals key (string)
let reportsRange = 12;           // months: 3, 6, 12, or "custom"
let reportsCustomStart = null;   // YYYY-MM
let reportsCustomEnd = null;     // YYYY-MM
let reportsMaPeriod = 3;         // moving average window: 3, 6, 12
let trendChartInstance = null;
let allocationPieInstance = null;
let savingsPieInstance = null;
let investmentsPieInstance = null;
let driftChartInstance = null;
let reportsInitialised = false;

// Totals row keys (used in dropdown alongside provider IDs)
const TOTALS_ROWS = [
  { key: "total-si",    label: "Savings + Investments" },
  { key: "total-s",     label: "Savings only" },
  { key: "total-i",     label: "Investments only" },
  { key: "total-p",     label: "Pension" },
  { key: "total-grand", label: "Grand Total" },
];

// Category colours matching CSS variables
const CAT_COLOURS = {
  Saving:     "#27ae60",
  Investment: "#2980b9",
  Pension:    "#8e44ad",
  Index:      "#e67e22",
};
const TOTALS_COLOUR = "#16a085"; // teal, distinct from categories

// ── Initialise Reports ──

function initReports() {
  if (!reportsInitialised) {
    populateRowSelector();
    bindReportsEvents();
    reportsInitialised = true;
  }
  // Default to Grand Total if not yet set
  if (!reportsSelectedRow) {
    reportsSelectedRow = "total-grand";
    document.getElementById("reports-row-select").value = reportsSelectedRow;
  }
  renderReports();
}

function populateRowSelector() {
  const select = document.getElementById("reports-row-select");
  select.innerHTML = "";

  // Totals group
  const totalsGroup = document.createElement("optgroup");
  totalsGroup.label = "Totals";
  TOTALS_ROWS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.key;
    opt.textContent = t.label;
    totalsGroup.appendChild(opt);
  });
  select.appendChild(totalsGroup);

  // Provider groups by category
  ["Saving", "Investment", "Pension", "Index"].forEach(cat => {
    const catProviders = getAllProviders().filter(p => p.category === cat);
    if (catProviders.length === 0) return;
    const group = document.createElement("optgroup");
    group.label = cat;
    catProviders.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.label;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
}

function bindReportsEvents() {
  // Row selector
  document.getElementById("reports-row-select").addEventListener("change", (e) => {
    const val = e.target.value;
    reportsSelectedRow = isNaN(val) ? val : parseInt(val);
    renderReports();
  });

  // Range buttons
  document.querySelectorAll(".range-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.dataset.range;
      if (val === "custom") {
        reportsRange = "custom";
        document.getElementById("custom-range-fields").hidden = false;
        populateCustomRangeSelectors();
      } else {
        reportsRange = parseInt(val);
        document.getElementById("custom-range-fields").hidden = true;
      }
      renderReports();
    });
  });

  // Moving average buttons
  document.querySelectorAll(".ma-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ma-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      reportsMaPeriod = parseInt(btn.dataset.ma);
      renderReports();
    });
  });
}

// ── Custom date range ──

function populateCustomRangeSelectors() {
  const months = getMonthsWithData();
  if (months.length === 0) return;

  const earliest = months[0];
  const latest = months[months.length - 1];
  const [ey, em] = earliest.split("-").map(Number);
  const [ly, lm] = latest.split("-").map(Number);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Populate month selectors
  ["range-start-month", "range-end-month"].forEach(id => {
    const sel = document.getElementById(id);
    if (sel.options.length > 0) return; // already populated
    sel.innerHTML = "";
    monthNames.forEach((name, i) => {
      const opt = document.createElement("option");
      opt.value = i + 1;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  });

  // Populate year selectors
  ["range-start-year", "range-end-year"].forEach(id => {
    const sel = document.getElementById(id);
    if (sel.options.length > 0) return;
    sel.innerHTML = "";
    for (let y = ey; y <= ly; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    }
  });

  // Set defaults
  if (!reportsCustomStart) {
    reportsCustomStart = earliest;
    reportsCustomEnd = latest;
  }

  const [sy, sm] = reportsCustomStart.split("-").map(Number);
  const [sey, sem] = reportsCustomEnd.split("-").map(Number);
  document.getElementById("range-start-month").value = sm;
  document.getElementById("range-start-year").value = sy;
  document.getElementById("range-end-month").value = sem;
  document.getElementById("range-end-year").value = sey;

  // Change listeners
  const onCustomChange = () => {
    const startM = document.getElementById("range-start-month").value;
    const startY = document.getElementById("range-start-year").value;
    const endM = document.getElementById("range-end-month").value;
    const endY = document.getElementById("range-end-year").value;
    reportsCustomStart = formatYearMonth(parseInt(startY), parseInt(startM));
    reportsCustomEnd = formatYearMonth(parseInt(endY), parseInt(endM));
    if (reportsCustomStart > reportsCustomEnd) {
      reportsCustomEnd = reportsCustomStart;
      document.getElementById("range-end-month").value = startM;
      document.getElementById("range-end-year").value = startY;
    }
    renderReports();
  };

  ["range-start-month", "range-start-year", "range-end-month", "range-end-year"].forEach(id => {
    const el = document.getElementById(id);
    // Remove old listener by cloning
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    newEl.addEventListener("change", onCustomChange);
  });
}

// ── Data helpers ──

function getReportsMonthRange() {
  const monthsWithData = getMonthsWithData();
  if (monthsWithData.length === 0) return [];
  const latest = monthsWithData[monthsWithData.length - 1];

  if (reportsRange === "custom") {
    const result = [];
    let cursor = reportsCustomStart || monthsWithData[0];
    const end = reportsCustomEnd || latest;
    while (cursor <= end) {
      result.push(cursor);
      cursor = getNextMonth(cursor);
    }
    return result;
  }
  return getMonthRange(latest, reportsRange);
}

function getValueForRow(yearMonth, row) {
  if (typeof row === "number") {
    const entry = entries[yearMonth];
    return entry ? (entry.values[row] || 0) : 0;
  }
  const t = calculateTotalsForMonth(yearMonth);
  const map = {
    "total-si":    t.savingsInvestments,
    "total-s":     t.saving,
    "total-i":     t.investment,
    "total-p":     t.pension,
    "total-grand": t.grandTotal,
  };
  return map[row] || 0;
}

function getSeriesData(months) {
  return months.map(ym => getValueForRow(ym, reportsSelectedRow));
}

function getRowColour(row) {
  if (typeof row === "number") {
    const provider = getAllProviders().find(p => p.id === row);
    return provider ? (CAT_COLOURS[provider.category] || "#2c3e50") : "#2c3e50";
  }
  return TOTALS_COLOUR;
}

function getRowLabel(row) {
  if (typeof row === "number") {
    const provider = getAllProviders().find(p => p.id === row);
    return provider ? provider.label : "Unknown";
  }
  const totalsRow = TOTALS_ROWS.find(t => t.key === row);
  return totalsRow ? totalsRow.label : "Unknown";
}

// ── Moving average ──

function calculateMovingAverage(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    return sum / period;
  });
}

// ── Growth rate ──

function calculateGrowthRate(data) {
  const firstNonZero = data.find(v => v > 0);
  const lastVal = data[data.length - 1];
  if (!firstNonZero || firstNonZero === 0) return null;
  return ((lastVal - firstNonZero) / firstNonZero) * 100;
}

// ── Render: Trend chart ──

function renderTrendChart() {
  const months = getReportsMonthRange();
  if (months.length === 0) {
    if (trendChartInstance) { trendChartInstance.destroy(); trendChartInstance = null; }
    return;
  }

  const labels = months.map(formatShortMonth);
  const data = getSeriesData(months);
  const ma = calculateMovingAverage(data, reportsMaPeriod);
  const colour = getRowColour(reportsSelectedRow);
  const useLineOnly = months.length > 12;

  if (trendChartInstance) trendChartInstance.destroy();

  const ctx = document.getElementById("trend-chart").getContext("2d");
  const datasets = [];

  if (useLineOnly) {
    datasets.push({
      label: getRowLabel(reportsSelectedRow),
      data: data,
      borderColor: colour,
      backgroundColor: colour + "33",
      fill: true,
      tension: 0.3,
      type: "line",
      pointRadius: 3,
    });
  } else {
    datasets.push({
      label: getRowLabel(reportsSelectedRow),
      data: data,
      backgroundColor: colour + "99",
      borderColor: colour,
      borderWidth: 1,
      type: "bar",
    });
  }

  // Moving average line
  datasets.push({
    label: reportsMaPeriod + "m Avg",
    data: ma,
    borderColor: "#e74c3c",
    borderWidth: 2,
    borderDash: [6, 3],
    pointRadius: 0,
    type: "line",
    fill: false,
  });

  trendChartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              return ctx.dataset.label + ": \u00A3" + formatNumber(val);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { callback: val => "\u00A3" + val.toLocaleString() }
        }
      }
    }
  });
}

// ── Render: Growth rate callout ──

function renderGrowthCallout() {
  const months = getReportsMonthRange();
  const data = getSeriesData(months);
  const el = document.getElementById("growth-rate-callout");

  const rate = calculateGrowthRate(data);
  if (rate === null) {
    el.textContent = "Insufficient data for growth rate";
    el.className = "growth-callout";
    return;
  }

  const firstNonZero = data.find(v => v > 0);
  const lastVal = data[data.length - 1];
  const sign = rate >= 0 ? "+" : "";
  const arrow = rate >= 0 ? "\u25B2" : "\u25BC";
  const cls = rate >= 0 ? "growth-positive" : "growth-negative";

  el.className = "growth-callout " + cls;
  el.innerHTML =
    `<span class="growth-pct">${arrow} ${sign}${rate.toFixed(1)}%</span>` +
    `<span class="growth-range">\u00A3${formatNumber(firstNonZero)} \u2192 \u00A3${formatNumber(lastVal)}</span>`;
}

// ── Render: Pie charts ──

function populatePieMonthSelector() {
  const select = document.getElementById("pie-month-select");
  const months = getMonthsWithData();
  select.innerHTML = "";
  months.slice().reverse().forEach(ym => {
    const opt = document.createElement("option");
    opt.value = ym;
    opt.textContent = formatMonthLabel(ym);
    select.appendChild(opt);
  });

  // Remove old listener by cloning
  const newSelect = select.cloneNode(true);
  select.parentNode.replaceChild(newSelect, select);
  newSelect.addEventListener("change", () => renderPieCharts());
}

function renderPieCharts() {
  const ym = document.getElementById("pie-month-select").value;
  if (!ym) return;
  renderAllocationPie(ym);
  renderProviderPies(ym);
}

function renderAllocationPie(yearMonth) {
  const t = calculateTotalsForMonth(yearMonth);
  if (allocationPieInstance) allocationPieInstance.destroy();

  const ctx = document.getElementById("allocation-pie").getContext("2d");
  allocationPieInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Savings", "Investments", "Pension"],
      datasets: [{
        data: [t.saving, t.investment, t.pension],
        backgroundColor: [CAT_COLOURS.Saving, CAT_COLOURS.Investment, CAT_COLOURS.Pension],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
              return `${ctx.label}: \u00A3${formatNumber(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// Provider pie colour palettes — shades within each category
const SAVING_SHADES = ["#27ae60", "#2ecc71", "#1abc9c", "#16a085", "#0e8a5f", "#45b97c", "#6fcf97"];
const INVESTMENT_SHADES = ["#2980b9", "#3498db", "#1e6fa0", "#5dade2", "#2471a3", "#85c1e9", "#1a5276"];

function renderProviderPies(yearMonth) {
  const entry = entries[yearMonth];
  const allProviders = getAllProviders();

  renderCategoryProviderPie(
    "savings-pie", "savingsPieInstance",
    allProviders.filter(p => p.category === "Saving"),
    entry, SAVING_SHADES, "Savings Providers"
  );

  renderCategoryProviderPie(
    "investments-pie", "investmentsPieInstance",
    allProviders.filter(p => p.category === "Investment"),
    entry, INVESTMENT_SHADES, "Investment Providers"
  );
}

function renderCategoryProviderPie(canvasId, instanceKey, providerList, entry, shades, title) {
  // Destroy existing
  if (instanceKey === "savingsPieInstance" && savingsPieInstance) savingsPieInstance.destroy();
  if (instanceKey === "investmentsPieInstance" && investmentsPieInstance) investmentsPieInstance.destroy();

  const ctx = document.getElementById(canvasId).getContext("2d");
  const labels = [];
  const values = [];

  providerList.forEach(p => {
    const val = entry ? (entry.values[p.id] || 0) : 0;
    if (val > 0) {
      labels.push(p.label);
      values.push(val);
    }
  });

  if (values.length === 0) {
    // Draw empty state
    const chart = new Chart(ctx, {
      type: "pie",
      data: { labels: ["No data"], datasets: [{ data: [1], backgroundColor: ["#ddd"] }] },
      options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: title } } }
    });
    if (instanceKey === "savingsPieInstance") savingsPieInstance = chart;
    if (instanceKey === "investmentsPieInstance") investmentsPieInstance = chart;
    return;
  }

  const colours = values.map((_, i) => shades[i % shades.length]);

  const chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colours }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: title },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
              return `${ctx.label}: \u00A3${formatNumber(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  if (instanceKey === "savingsPieInstance") savingsPieInstance = chart;
  if (instanceKey === "investmentsPieInstance") investmentsPieInstance = chart;
}

// ── Render: Allocation drift (stacked area) ──

function renderAllocationDrift() {
  const months = getReportsMonthRange();
  if (months.length < 2) {
    if (driftChartInstance) { driftChartInstance.destroy(); driftChartInstance = null; }
    return;
  }

  const labels = months.map(formatShortMonth);
  const savingPcts = [], investmentPcts = [], pensionPcts = [];

  months.forEach(ym => {
    const t = calculateTotalsForMonth(ym);
    const total = t.grandTotal || 1;
    savingPcts.push((t.saving / total) * 100);
    investmentPcts.push((t.investment / total) * 100);
    pensionPcts.push((t.pension / total) * 100);
  });

  if (driftChartInstance) driftChartInstance.destroy();

  const ctx = document.getElementById("allocation-drift-chart").getContext("2d");
  driftChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Savings %",     data: savingPcts,     backgroundColor: CAT_COLOURS.Saving + "66",     borderColor: CAT_COLOURS.Saving,     fill: true },
        { label: "Investments %", data: investmentPcts, backgroundColor: CAT_COLOURS.Investment + "66", borderColor: CAT_COLOURS.Investment, fill: true },
        { label: "Pension %",     data: pensionPcts,    backgroundColor: CAT_COLOURS.Pension + "66",    borderColor: CAT_COLOURS.Pension,    fill: true },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { stacked: true, max: 100, ticks: { callback: v => v + "%" } },
        x: { stacked: true }
      },
      plugins: { legend: { position: "top" } }
    }
  });
}

// ── Render: Best/worst provider ──

function renderBestWorstCallout() {
  const months = getReportsMonthRange();
  const el = document.getElementById("best-worst-callout");

  if (months.length < 2) {
    el.innerHTML = "";
    return;
  }

  const first = months[0];
  const last = months[months.length - 1];
  const providerGrowth = [];

  getAllProviders()
    .filter(p => p.category !== "Index")
    .forEach(p => {
      const startEntry = entries[first];
      const endEntry = entries[last];
      const startVal = startEntry ? (startEntry.values[p.id] || 0) : 0;
      const endVal = endEntry ? (endEntry.values[p.id] || 0) : 0;

      if (startVal > 0) {
        const growth = ((endVal - startVal) / startVal) * 100;
        providerGrowth.push({ label: p.label, growth });
      }
    });

  if (providerGrowth.length < 2) {
    el.innerHTML = "";
    return;
  }

  providerGrowth.sort((a, b) => b.growth - a.growth);
  const best = providerGrowth[0];
  const worst = providerGrowth[providerGrowth.length - 1];

  el.innerHTML =
    `<div class="perf-card perf-best">` +
      `<span class="perf-label">Best</span>` +
      `<span class="perf-name">${best.label}</span>` +
      `<span class="perf-value growth-positive">+${best.growth.toFixed(1)}%</span>` +
    `</div>` +
    `<div class="perf-card perf-worst">` +
      `<span class="perf-label">Worst</span>` +
      `<span class="perf-name">${worst.label}</span>` +
      `<span class="perf-value growth-negative">${worst.growth.toFixed(1)}%</span>` +
    `</div>`;
}

// ── Render: FTSE comparison ──

function renderFtseComparison() {
  const months = getReportsMonthRange();
  const el = document.getElementById("ftse-comparison");

  if (months.length < 2) {
    el.innerHTML = "";
    return;
  }

  const ftseProvider = getAllProviders().find(p => p.category === "Index");
  if (!ftseProvider) {
    el.innerHTML = "";
    return;
  }

  const first = months[0];
  const last = months[months.length - 1];

  const ftseStart = entries[first] ? (entries[first].values[ftseProvider.id] || 0) : 0;
  const ftseEnd = entries[last] ? (entries[last].values[ftseProvider.id] || 0) : 0;
  const ftseGrowth = ftseStart > 0 ? ((ftseEnd - ftseStart) / ftseStart) * 100 : null;

  const totalsStart = calculateTotalsForMonth(first);
  const totalsEnd = calculateTotalsForMonth(last);
  const invStart = totalsStart.investment;
  const invEnd = totalsEnd.investment;
  const portfolioGrowth = invStart > 0 ? ((invEnd - invStart) / invStart) * 100 : null;

  if (ftseGrowth === null || portfolioGrowth === null) {
    el.innerHTML = '<p class="ftse-no-data">Insufficient data for comparison</p>';
    return;
  }

  const diff = portfolioGrowth - ftseGrowth;
  const diffSign = diff >= 0 ? "+" : "";
  const diffCls = diff >= 0 ? "growth-positive" : "growth-negative";

  const fmtPct = (v) => (v >= 0 ? "+" : "") + v.toFixed(1) + "%";

  el.innerHTML =
    `<div class="ftse-card">` +
      `<h3>Investments vs ${ftseProvider.label}</h3>` +
      `<div class="ftse-row">` +
        `<div class="ftse-item"><span class="ftse-item-label">Your Investments</span><span class="ftse-item-value">${fmtPct(portfolioGrowth)}</span></div>` +
        `<div class="ftse-item"><span class="ftse-item-label">${ftseProvider.label}</span><span class="ftse-item-value">${fmtPct(ftseGrowth)}</span></div>` +
        `<div class="ftse-item"><span class="ftse-item-label">Difference</span><span class="ftse-item-value ${diffCls}">${diffSign}${diff.toFixed(1)}pp</span></div>` +
      `</div>` +
    `</div>`;
}

// ── Jump to Reports from data table ──

function jumpToReports(rowKey) {
  reportsSelectedRow = rowKey;
  switchView("reports");
  document.getElementById("reports-row-select").value = rowKey;
  renderReports();
}

// ── Master render ──

function renderReports() {
  renderTrendChart();
  renderGrowthCallout();
  populatePieMonthSelector();
  renderPieCharts();
  renderAllocationDrift();
  renderBestWorstCallout();
  renderFtseComparison();
}
