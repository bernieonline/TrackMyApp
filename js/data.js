// data.js — Monthly entry data model (in-memory)

// entries keyed by "YYYY-MM", each: { values: { providerId: number }, comment: string }
const entries = {};

function getEntry(yearMonth) {
  if (!entries[yearMonth]) {
    entries[yearMonth] = { values: {}, comment: "" };
  }
  return entries[yearMonth];
}

function hasEntry(yearMonth) {
  const e = entries[yearMonth];
  if (!e) return false;
  // Has data if any value is set or comment is non-empty
  return Object.keys(e.values).length > 0 || e.comment.length > 0;
}

function setProviderValue(yearMonth, providerId, value) {
  const entry = getEntry(yearMonth);
  if (value === null || value === undefined || value === "") {
    delete entry.values[providerId];
  } else {
    entry.values[providerId] = parseFloat(value);
  }
}

function setComment(yearMonth, text) {
  const entry = getEntry(yearMonth);
  entry.comment = text;
}

/**
 * Date defaulting per Spec Section 4:
 * - Current month if previous month's entry exists
 * - Otherwise previous month
 * Returns { month: 1-12, year: YYYY }
 */
function getDefaultDate() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Calculate previous month
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = currentYear - 1;
  }

  const prevKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

  if (hasEntry(prevKey)) {
    return { month: currentMonth, year: currentYear };
  }
  return { month: prevMonth, year: prevYear };
}

function formatYearMonth(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function loadEntries(data) {
  // Clear existing entries and restore from saved data
  Object.keys(entries).forEach(k => delete entries[k]);
  Object.keys(data).forEach(k => {
    entries[k] = data[k];
  });
}

/**
 * Returns sorted array of year-month keys that have data.
 * E.g. ["2025-09", "2025-10", "2026-01"]
 */
function getMonthsWithData() {
  return Object.keys(entries)
    .filter(k => hasEntry(k))
    .sort();
}

/**
 * Step one month backward from a YYYY-MM string.
 */
function getPreviousMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  if (m === 1) return formatYearMonth(y - 1, 12);
  return formatYearMonth(y, m - 1);
}

/**
 * Step one month forward from a YYYY-MM string.
 */
function getNextMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  if (m === 12) return formatYearMonth(y + 1, 1);
  return formatYearMonth(y, m + 1);
}

/**
 * Format a YYYY-MM string as a readable label, e.g. "August 2026".
 */
function formatMonthLabel(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[m - 1] + " " + y;
}

/**
 * Get the last N months ending at yearMonth (inclusive).
 * Returns array of YYYY-MM strings, oldest first.
 */
function getMonthRange(yearMonth, count) {
  const months = [yearMonth];
  let current = yearMonth;
  for (let i = 1; i < count; i++) {
    current = getPreviousMonth(current);
    months.unshift(current);
  }
  return months;
}

/**
 * Calculate category totals for a given YYYY-MM.
 * Returns { saving, investment, pension, savingsInvestments, grandTotal }
 * Index providers are excluded from all totals.
 */
function calculateTotalsForMonth(yearMonth) {
  const entry = entries[yearMonth];
  const allProviders = getAllProviders();
  let saving = 0, investment = 0, pension = 0;

  if (entry) {
    allProviders.forEach(p => {
      const val = entry.values[p.id];
      if (val === undefined) return;
      switch (p.category) {
        case "Saving":     saving += val; break;
        case "Investment": investment += val; break;
        case "Pension":    pension += val; break;
      }
    });
  }

  return {
    saving,
    investment,
    pension,
    savingsInvestments: saving + investment,
    grandTotal: saving + investment + pension
  };
}
