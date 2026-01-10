import { initRealtimeListener } from './storage.js';
import { renderApp } from './ui/appShell.js';
import { state, setState } from './state.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import * as eventActions from './actions/events.js';
import * as clubActions from './actions/clubs.js';
import * as authActions from './actions/auth.js';

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
        try { el.setSelectionRange(el.value.length, el.value.length); } catch(e) {}
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
  
  // Show loading state initially
  if (appElement) {
    appElement.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#666;">Loading UniSync...</div>';
  }

  // 1. Listen for Auth Changes
  onAuthStateChanged(auth, (user) => {
    state.currentUser = user;
    console.log("Auth State Changed:", user ? user.email : "Logged out");
    
    // 2. Start Data Listener
    initRealtimeListener();
    
    // 3. Render
    renderApp();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}