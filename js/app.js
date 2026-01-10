import { initRealtimeListener } from './storage.js'; // Using Firebase listener now
import { renderApp } from './ui/appShell.js';
import { renderModals } from './ui/modals.js';
import { state, setState } from './state.js';
import { handleCreateEvent, registerForEvent, openRegistrationModal, unregisterFromEvent } from './actions/events.js';
import { joinClub, leaveClub, handleClubApplication } from './actions/clubs.js';
import { handleSignup, handleGoogleLogin, handleLogout } from './actions/auth.js';

// --- State Management for Questions Modal ---
let eventQuestions = [];

// --- Global Functions (Attached to Window for HTML onclick attributes) ---
Object.assign(window, {
  
  // Navigation
  switchTab: (tab) => {
    setState('currentTab', tab);
    renderApp();
  },
  
  filterByCategory: (category) => {
    setState('selectedCategory', category);
    renderApp();
  },

  filterByOrganization: (val) => {
    setState('selectedOrganization', val.toLowerCase());
    renderApp();
    setTimeout(() => {
        const el = document.getElementById('org-search');
        if(el) {
            el.focus();
            el.value = val; 
        }
    }, 0);
  },

  toggleDarkMode: () => {
    setState('darkMode', !state.darkMode);
    renderApp();
  },

  // Modal Controls
  openSignupModal: () => document.getElementById('signup-modal').classList.remove('hidden'),
  closeSignupModal: () => document.getElementById('signup-modal').classList.add('hidden'),
  closeSignupModalOnBackdrop: (e) => { if(e.target.id === 'signup-modal') window.closeSignupModal() },

  openCreateModal: () => {
     eventQuestions = []; // Reset questions
     document.getElementById('create-modal').classList.remove('hidden');
  },
  closeCreateModal: () => document.getElementById('create-modal').classList.add('hidden'),
  closeModalOnBackdrop: (e) => { if(e.target.id === 'create-modal') window.closeCreateModal() },

  // Questions Logic
  openQuestionsModal: () => {
      document.getElementById('questions-modal').classList.remove('hidden');
      renderQuestionsList();
  },
  closeQuestionsModal: () => document.getElementById('questions-modal').classList.add('hidden'),
  closeQuestionsModalOnBackdrop: (e) => { if(e.target.id === 'questions-modal') window.closeQuestionsModal() },
  
  addQuestion: () => {
      // 1. Fix: Ensure we are pushing a valid object structure
      eventQuestions.push({ id: Date.now(), question: '', required: false, yesNoType: false });
      renderQuestionsList();
  },
  removeQuestion: (id) => {
      eventQuestions = eventQuestions.filter(q => q.id !== id);
      renderQuestionsList();
  },
  updateQuestion: (id, field, value) => {
      const q = eventQuestions.find(q => q.id === id);
      if(q) q[field] = value;
  },
  saveQuestions: () => {
      window.closeQuestionsModal();
      // Visual feedback that questions are saved?
      const btn = document.querySelector('#create-modal button[onclick="openQuestionsModal()"]');
      if(btn) btn.textContent = `✓ ${eventQuestions.length} Questions Added`;
  },
  
  // Registration
  closeRegistrationModal: () => document.getElementById('registration-modal').classList.add('hidden'),
  closeRegistrationModalOnBackdrop: (e) => { if(e.target.id === 'registration-modal') window.closeRegistrationModal() },
  
  // Details
  openEventDetails: (id) => { /* Details logic if needed, usually managed by render logic */ },
  closeEventDetailsModal: () => document.getElementById('event-details-modal').classList.add('hidden'),
  closeEventDetailsModalOnBackdrop: (e) => { if(e.target.id === 'event-details-modal') window.closeEventDetailsModal() },

  // Confirm Modal
  openConfirmModal: (msg, action) => {
      const m = document.getElementById('confirm-modal');
      document.getElementById('confirm-message').textContent = msg;
      m.classList.remove('hidden');
      document.getElementById('confirm-action-btn').onclick = () => {
          action();
          window.closeConfirmModal();
      };
  },
  closeConfirmModal: () => document.getElementById('confirm-modal').classList.add('hidden'),
  closeConfirmModalOnBackdrop: (e) => { if(e.target.id === 'confirm-modal') window.closeConfirmModal() },

  // Clubs
  openClubApplicationModal: () => document.getElementById('club-application-modal').classList.remove('hidden'),
  closeClubApplicationModal: () => document.getElementById('club-application-modal').classList.add('hidden'),
  closeClubApplicationModalOnBackdrop: (e) => { if(e.target.id === 'club-application-modal') window.closeClubApplicationModal() },

  // Action Handlers
  handleSignup,
  handleGoogleLogin,
  handleLogout,
  handleCreateEvent: (e) => handleCreateEvent(e, eventQuestions), // Pass questions to event creator
  handleRegistration,
  handleClubApplication,
  joinClub,
  leaveClub,
  registerForEvent,
  openRegistrationModal,
  unregisterFromEvent
});

// Render the questions list inside the modal
function renderQuestionsList() {
    const list = document.getElementById('questions-list');
    if(!list) return;
    
    list.innerHTML = eventQuestions.map((q, idx) => `
        <div class="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div class="flex items-start justify-between mb-3">
            <span class="font-medium text-sm text-gray-500">Question ${idx + 1}</span>
            <button type="button" onclick="removeQuestion(${q.id})" class="text-red-500 font-bold px-2">×</button>
          </div>
          <input 
            type="text" 
            placeholder="Enter your question"
            value="${q.question || ''}"
            onchange="updateQuestion(${q.id}, 'question', this.value)"
            class="w-full px-3 py-2 rounded-lg mb-3 bg-white dark:bg-gray-900 border"
          >
          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" ${q.required ? 'checked' : ''} onchange="updateQuestion(${q.id}, 'required', this.checked)">
              Mandatory
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" ${q.yesNoType ? 'checked' : ''} onchange="updateQuestion(${q.id}, 'yesNoType', this.checked)">
              Yes/No Answer
            </label>
          </div>
        </div>
    `).join('');
}

// Initialize
(async function init() {
    const app = document.getElementById('app');
    if(app) app.innerHTML = `<div class="flex items-center justify-center h-screen">Loading...</div>`;
    
    // Start Listener
    initRealtimeListener(); 
})();
