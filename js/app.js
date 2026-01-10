import { loadData } from './storage.js';
import { renderApp } from './ui/appShell.js';
import { state, setState } from './state.js';
import * as eventActions from './actions/events.js';
import * as clubActions from './actions/clubs.js';
import * as authActions from './actions/auth.js';
// NEW: Import the firebase init function
import { initFirebase } from './firebase.js';

// --- Global Assignments for Inline Event Handlers ---
Object.assign(window, {
  ...eventActions,
  ...clubActions,
  ...authActions,
  
  switchTab: (tab) => {
    setState('currentTab', tab);
    renderApp();
  },
  
  filterByCategory: (category) => {
    setState('selectedCategory', category);
    renderApp();
  },
  
  filterByOrganization: (searchText) => {
    setState('selectedOrganization', searchText.toLowerCase());
    renderApp();
    
    setTimeout(() => {
      const el = document.getElementById('org-search');
      if (el) {
        el.focus();
        const len = el.value.length;
        try { el.setSelectionRange(len, len); } catch(e) {}
      }
    }, 0);
  },
  
  toggleDarkMode: () => {
    setState('darkMode', !state.darkMode);
    renderApp();
  }
});

// --- Initialization ---
async function init() {
  const appElement = document.getElementById('app');
  
  if (appElement) {
    appElement.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">Loading UniSync...</div>';
  }

  try {
    console.log("Initializing UniSync...");
    
    // 1. Attempt to load from LocalStorage first (fast)
    loadData();
    
    // 2. Initialize Firebase and fetch fresh data (async)
    // This will override local data when finished
    await initFirebase();

    // 3. Render
    renderApp();
    console.log("UniSync rendered successfully.");
  } catch (err) {
    console.error("Critical error starting app:", err);
    if (appElement) {
      appElement.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif;">
        <h3>Error Loading App</h3>
        <pre>${err.message}</pre>
      </div>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}