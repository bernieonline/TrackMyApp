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
