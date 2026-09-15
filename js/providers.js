// providers.js — Provider data model (in-memory)

// Display order: Saving/Investment first, then Pension, then Index (FTSE) last
const CATEGORY_ORDER = { Saving: 0, Investment: 0, Pension: 1, Index: 2 };

const providers = [
  { id: 1,  label: "Natwest Current",          category: "Saving",     active: true },
  { id: 2,  label: "Natwest Credit Card",      category: "Saving",     active: true },
  { id: 3,  label: "Starling",                 category: "Saving",     active: true },
  { id: 4,  label: "Close Bros ISA Mary",      category: "Saving",     active: true },
  { id: 5,  label: "Close Bros ISA Bernard",   category: "Saving",     active: true },
  { id: 6,  label: "Nationwide",               category: "Saving",     active: true },
  { id: 7,  label: "Marcus Bernard",           category: "Saving",     active: true },
  { id: 8,  label: "Vanguard Bernard",         category: "Investment", active: true },
  { id: 9,  label: "Aviva ISA Mary",           category: "Investment", active: true },
  { id: 10, label: "Aviva ISA Bernard",        category: "Investment", active: true },
  { id: 11, label: "Aviva Pension Valuation",  category: "Pension",    active: true },
  { id: 12, label: "Leeds ISA Mary",           category: "Saving",     active: true },
  { id: 13, label: "Leeds ISA Bernard",        category: "Saving",     active: true },
  { id: 14, label: "Santander Mary",           category: "Saving",     active: true },
  { id: 15, label: "Santander Bernard",        category: "Saving",     active: true },
  { id: 16, label: "FTSE 100",                 category: "Index",      active: true },
];

let nextId = 17;

function sortedProviders(list) {
  return list.slice().sort((a, b) => {
    const orderA = CATEGORY_ORDER[a.category] !== undefined ? CATEGORY_ORDER[a.category] : 0;
    const orderB = CATEGORY_ORDER[b.category] !== undefined ? CATEGORY_ORDER[b.category] : 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.id - b.id;
  });
}

function getActiveProviders() {
  return sortedProviders(providers.filter(p => p.active));
}

function getAllProviders() {
  return sortedProviders(providers);
}

function addProvider(label, category) {
  const provider = { id: nextId++, label, category, active: true };
  providers.push(provider);
  return provider;
}

function updateProviderLabel(id, newLabel) {
  const p = providers.find(p => p.id === id);
  if (p) p.label = newLabel;
}

function toggleProviderActive(id) {
  const p = providers.find(p => p.id === id);
  if (p) p.active = !p.active;
}

function loadProviders(data) {
  providers.length = 0;
  data.forEach(p => providers.push(p));
  // Ensure nextId is higher than any existing id
  nextId = providers.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}
