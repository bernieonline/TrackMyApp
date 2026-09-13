// storage.js — localStorage draft autosave

const STORAGE_KEY_ENTRIES = "trackmyapp_entries";
const STORAGE_KEY_PROVIDERS = "trackmyapp_providers";

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(providers));
  } catch (e) {
    console.warn("Failed to save draft:", e);
  }
}

function loadDraft() {
  try {
    const savedProviders = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (savedProviders) {
      loadProviders(JSON.parse(savedProviders));
    }
    const savedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (savedEntries) {
      loadEntries(JSON.parse(savedEntries));
    }
  } catch (e) {
    console.warn("Failed to load draft:", e);
  }
}
