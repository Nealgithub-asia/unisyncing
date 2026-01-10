import { loadData } from './storage.js';
import { renderApp } from './ui/appShell.js';
import { state, setState } from './state.js';
import * as eventActions from './actions/events.js';
import * as clubActions from './actions/clubs.js';
import * as authActions from './actions/auth.js';

// --- Global Assignments for Inline Event Handlers ---
// We explicitly assign these to window so HTML template strings can call them
Object.assign(window, {
  ...eventActions,
  ...clubActions,
  ...authActions,
  
  // UI State Actions
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
    
    // Maintain focus on search input after re-render
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
function init() {
  const appElement = document.getElementById('app');
  
  // 1. Show loading state immediately
  if (appElement) {
    appElement.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">Loading UniSync...</div>';
  }

  // 2. Small delay to ensure SDKs/DOM are settled, then render
  setTimeout(() => {
    try {
      console.log("Initializing UniSync...");
      loadData();
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
  }, 50);
}

// Robust DOM Ready Check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}