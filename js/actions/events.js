import { state } from '../state.js';
import { renderApp } from '../ui/appShell.js';
import { config as defaultConfig } from '../config.js';
import { formatDate } from '../utils.js';

// --- Registration Logic ---

// ADDED: This function is required because the Discover list calls it directly
export function registerForEvent(eventId) {
  openRegistrationModal(eventId);
}

export function openRegistrationModal(eventId) {
  state.currentRegistrationEventId = eventId;
  document.getElementById('registration-modal').classList.remove('hidden');
  
  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  const container = document.getElementById('registration-questions');
  const questions = event.questions ? JSON.parse(event.questions) : [];
  const config = window.elementSdk?.config || defaultConfig;
  const isDarkMode = config.dark_mode || false;
  const surfaceColor = isDarkMode ? "#2d2d2d" : (config.surface_color || defaultConfig.surface_color);
  const textColor = isDarkMode ? "#ffffff" : (config.text_color || defaultConfig.text_color);

  if (questions.length === 0) {
    container.innerHTML = `<p style="color: ${textColor};">Are you sure you want to register for <strong>${event.title}</strong>?</p>`;
  } else {
    container.innerHTML = questions.map(q => `
      <div>
        <label class="block mb-2 font-medium" style="color: ${textColor}; font-size: ${config.font_size * 0.93}px;">
          ${q.question} ${q.required ? '<span style="color:red">*</span>' : ''}
        </label>
        ${q.yesNoType 
          ? `<select name="${q.id}" ${q.required ? 'required' : ''} class="w-full px-4 py-2.5 rounded-lg" style="background: ${surfaceColor}; color: ${textColor}; border: 1px solid #e5e7eb;">
               <option value="">Select an answer</option>
               <option value="Yes">Yes</option>
               <option value="No">No</option>
             </select>`
          : `<input type="text" name="${q.id}" ${q.required ? 'required' : ''} class="w-full px-4 py-2.5 rounded-lg" style="background: ${surfaceColor}; color: ${textColor}; border: 1px solid #e5e7eb;" placeholder="Your answer">`
        }
      </div>
    `).join('');
  }
}

export function closeRegistrationModal() {
  document.getElementById('registration-modal').classList.add('hidden');
  document.getElementById('registration-form').reset();
  state.currentRegistrationEventId = null;
}

export function closeRegistrationModalOnBackdrop(event) {
  if (event.target.id === 'registration-modal') {
    closeRegistrationModal();
  }
}

export async function handleRegistration(event) {
  event.preventDefault();
  
  const eventId = state.currentRegistrationEventId;
  const eventToUpdate = state.allEvents.find(e => e.id === eventId);
  if (!eventToUpdate) return;

  const registerBtn = document.getElementById('register-btn');
  registerBtn.disabled = true;
  registerBtn.textContent = 'Registering...';

  // Add user to registrations
  const registrations = eventToUpdate.registrations ? JSON.parse(eventToUpdate.registrations) : {};
  registrations['currentUser'] = {
    userId: 'currentUser',
    registeredAt: new Date().toISOString()
  };
  eventToUpdate.registrations = JSON.stringify(registrations);
  
  // Optimistic update
  eventToUpdate.isSubscribed = true;

  try {
    const updateResult = window.dataSdk ? await window.dataSdk.update(eventToUpdate) : { isOk: true };
    
    if (updateResult.isOk) {
      closeRegistrationModal();
      state.currentTab = 'calendar';
      renderApp();
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    // Revert optimistic update
    eventToUpdate.isSubscribed = false;
    
    const config = window.elementSdk?.config || defaultConfig;
    const errorModal = document.createElement('div');
    errorModal.className = 'fixed inset-0 flex items-center justify-center p-4';
    errorModal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1001;';
    errorModal.innerHTML = `
      <div class="rounded-xl p-6 max-w-sm" style="background: ${config.background_color}; border: 1px solid #e5e7eb;">
        <p class="mb-4" style="color: ${config.text_color};">Failed to register. Please try again.</p>
        <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${config.primary_action}; color: ${config.background_color};">OK</button>
      </div>
    `;
    document.body.appendChild(errorModal);
  }

  registerBtn.disabled = false;
  registerBtn.textContent = 'Register';
}

// --- Event Details Logic ---

export function openEventDetails(eventId) {
  state.selectedEventForDetails = eventId;
  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  renderEventDetailsModalContent(event);
  document.getElementById('event-details-modal').classList.remove('hidden');
}

export function openDiscoverEventDetails(eventId) {
  openEventDetails(eventId);
}

function renderEventDetailsModalContent(event) {
  const config = window.elementSdk?.config || defaultConfig;
  const baseSize = config.font_size || defaultConfig.font_size;
  const isDarkMode = config.dark_mode || false;
  const backgroundColor = isDarkMode ? "#1a1a1a" : (config.background_color || defaultConfig.background_color);
  const surfaceColor = isDarkMode ? "#2d2d2d" : (config.surface_color || defaultConfig.surface_color);
  const textColor = isDarkMode ? "#ffffff" : (config.text_color || defaultConfig.text_color);
  const primaryAction = isDarkMode ? "#ffffff" : (config.primary_action || defaultConfig.primary_action);
  const secondaryAction = isDarkMode ? "#9ca3af" : (config.secondary_action || defaultConfig.secondary_action);

  const detailsContainer = document.getElementById('event-details-content');
  detailsContainer.innerHTML = `
    <div class="mb-4 flex gap-2 flex-wrap">
      <span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${event.category.toLowerCase() === 'academic' ? primaryAction : surfaceColor}; color: ${event.category.toLowerCase() === 'academic' ? backgroundColor : textColor}; font-size: ${baseSize * 0.8}px;">${event.category}</span>
      ${event.clubMembersOnly ? `<span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${primaryAction}; color: ${backgroundColor}; font-size: ${baseSize * 0.8}px;">Members Only</span>` : `<span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${surfaceColor}; color: ${textColor}; font-size: ${baseSize * 0.8}px;">Open to All</span>`}
    </div>
    <h3 class="font-bold mb-2" style="font-size: ${baseSize * 1.6}px; color: ${textColor};">${event.title}</h3>
    <p class="mb-4" style="font-size: ${baseSize * 0.93}px; color: ${secondaryAction};">${event.organization}</p>
    
    <div class="space-y-2 mb-6" style="font-size: ${baseSize * 0.93}px; color: ${textColor};">
      <div style="display: flex; align-items: center;">
        <div style="width: 24px; display: flex; justify-content: center;">
          <span><svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z" fill="currentColor"></path>
            </svg></span>
        </div>
        <span style="margin-left: 8px;">${formatDate(event.date)}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div style="width: 24px; display: flex; justify-content: center;">
          <span><svg width="17.6" height="17.6" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(2 2)">
                <circle cx="8.5" cy="8.5" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
                <path d="M8.5 5.5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              </g>
            </svg></span>
        </div>
        <span style="margin-left: 8px;">${event.time}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div style="width: 24px; display: flex; justify-content: center;">
          <span><svg width="24.24" height="24.24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(4 2)">
                <path d="M6.5 16.54l-.71-.71a29.49 29.49 0 01-2.58-3.23 9.24 9.24 0 01-1.12-2.35 4.42 4.42 0 01-.19-1.42 5.3 5.3 0 01.31-1.65 4.68 4.68 0 012.27-2.72 4.84 4.84 0 011.67-.52 5.24 5.24 0 011.7 0 4.84 4.84 0 011.67.52A4.68 4.68 0 0112 7.18a5.3 5.3 0 01.31 1.65 4.42 4.42 0 01-.19 1.42 9.24 9.24 0 01-1.12 2.35 29.49 29.49 0 01-2.58 3.23z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                <circle cx="6.5" cy="8.5" r="2.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle>
              </g>
            </svg></span>
        </div>
        <span style="margin-left: 8px;">${event.location}</span>
      </div>
    </div>

    <div class="mb-6">
      <h4 class="font-semibold mb-2" style="font-size: ${baseSize * 1.07}px; color: ${textColor};">Description</h4>
      <p style="font-size: ${baseSize * 0.93}px; color: ${textColor}; line-height: 1.6;">${event.description}</p>
    </div>

    <div class="flex gap-3">
      <button onclick="closeEventDetailsModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${surfaceColor}; color: ${textColor}; border: 1px solid #e5e7eb; font-size: ${baseSize * 0.93}px;">
        Close
      </button>
      ${event.isSubscribed ? `
        <button onclick="unregisterFromEvent('${event.id}')" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${primaryAction}; color: ${backgroundColor}; font-size: ${baseSize * 0.93}px;">
          Unregister
        </button>
      ` : `
        <button onclick="openRegistrationModalFromDetails('${event.id}')" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${primaryAction}; color: ${backgroundColor}; font-size: ${baseSize * 0.93}px;">
          Register
        </button>
      `}
    </div>
  `;
}

export function closeEventDetailsModal() {
  document.getElementById('event-details-modal').classList.add('hidden');
  state.selectedEventForDetails = null;
}

export function closeEventDetailsModalOnBackdrop(event) {
  if (event.target.id === 'event-details-modal') {
    closeEventDetailsModal();
  }
}

export function checkClubMembershipFromDetails(eventId) {
  closeEventDetailsModal();
  checkClubMembership(eventId);
}

export function checkClubMembership(eventId) {
  // Simple pass-through for now
  openRegistrationModal(eventId);
}

export function openRegistrationModalFromDetails(eventId) {
  closeEventDetailsModal();
  openRegistrationModal(eventId);
}

export async function unregisterFromEvent(eventId) {
  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  const config = window.elementSdk?.config || defaultConfig;
  const baseSize = config.font_size || defaultConfig.font_size;
  const isDarkMode = config.dark_mode || false;
  const backgroundColor = isDarkMode ? "#1a1a1a" : (config.background_color || defaultConfig.background_color);
  const surfaceColor = isDarkMode ? "#2d2d2d" : (config.surface_color || defaultConfig.surface_color);
  const textColor = isDarkMode ? "#ffffff" : (config.text_color || defaultConfig.text_color);
  const primaryAction = isDarkMode ? "#ffffff" : (config.primary_action || defaultConfig.primary_action);

  const confirmModal = document.createElement('div');
  confirmModal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center p-4';
  confirmModal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1002;';
  confirmModal.innerHTML = `
    <div class="rounded-2xl p-8 max-w-md w-full slide-in" style="background: ${backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
      <h3 class="font-bold mb-4" style="font-size: ${baseSize * 1.6}px; color: ${textColor};">Confirm Unregister</h3>
      <p class="mb-6" style="font-size: ${baseSize * 0.93}px; color: ${textColor};">Are you sure you want to unregister from "${event.title}"?</p>
      <div class="flex gap-3">
        <button id="cancel-unregister" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${surfaceColor}; color: ${textColor}; border: 1px solid #e5e7eb; font-size: ${baseSize * 0.93}px;">
          Cancel
        </button>
        <button id="confirm-unregister" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${primaryAction}; color: ${backgroundColor}; font-size: ${baseSize * 0.93}px;">
          Unregister
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmModal);

  document.getElementById('cancel-unregister').onclick = () => {
    confirmModal.remove();
  };

  document.getElementById('confirm-unregister').onclick = async () => {
    const confirmBtn = document.getElementById('confirm-unregister');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Unregistering...';

    event.isSubscribed = false;
    
    // Remove user from registrations
    const registrations = event.registrations ? JSON.parse(event.registrations) : {};
    delete registrations['currentUser'];
    event.registrations = JSON.stringify(registrations);
    
    // Close modals immediately
    confirmModal.remove();
    closeEventDetailsModal();
    
    // Optimistic update
    state.currentTab = 'discover';
    renderApp();
    
    const updateResult = window.dataSdk ? await window.dataSdk.update(event) : { isOk: true };
    if (!updateResult.isOk) {
      // Error handling
      const errorModal = document.createElement('div');
      errorModal.className = 'fixed inset-0 flex items-center justify-center p-4';
      errorModal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1001;';
      errorModal.innerHTML = `
        <div class="rounded-xl p-6 max-w-sm" style="background: ${config.background_color}; border: 1px solid #e5e7eb;">
          <p class="mb-4" style="color: ${config.text_color};">Failed to unregister. Please try again.</p>
          <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${config.primary_action}; color: ${config.background_color};">OK</button>
        </div>
      `;
      document.body.appendChild(errorModal);
    }
  };
}

export function confirmCancelRegistration(eventId) {
  // Reusing unregister logic as requested pattern
  unregisterFromEvent(eventId);
}

// --- Create Modal & Logic ---

export function openCreateModal() {
  state.eventQuestions = [];
  state.currentEditingEventId = null;
  document.getElementById('create-modal').classList.remove('hidden');
}

export function closeCreateModal() {
  document.getElementById('create-modal').classList.add('hidden');
  document.getElementById('event-form').reset();
  state.eventQuestions = [];
  state.currentEditingEventId = null;
}

export function closeModalOnBackdrop(event) {
  if (event.target.id === 'create-modal') {
    closeCreateModal();
  }
}

export async function handleCreateEvent(event) {
  event.preventDefault();
  
  if (state.allEvents.length >= 999) {
    const config = window.elementSdk?.config || defaultConfig;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center p-4';
    modal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1001;';
    modal.innerHTML = `
      <div class="rounded-xl p-6 max-w-sm" style="background: ${config.background_color}; border: 1px solid #e5e7eb;">
        <p class="mb-4" style="color: ${config.text_color}; font-size: ${config.font_size}px;">Maximum limit of 999 items reached. Please delete some items first.</p>
        <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${config.primary_action}; color: ${config.background_color};">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
    return;
  }

  const createBtn = document.getElementById('create-btn');
  const isClub = state.currentTab === 'organizations';
  createBtn.disabled = true;
  createBtn.textContent = isClub ? 'Creating...' : 'Creating...';

  const newEvent = {
    id: Date.now().toString(),
    title: document.getElementById('title').value,
    organization: isClub ? document.getElementById('title').value : document.getElementById('organization').value,
    category: document.getElementById('category').value,
    date: isClub ? '' : document.getElementById('date').value,
    time: isClub ? '' : document.getElementById('time').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    questions: JSON.stringify(state.eventQuestions),
    registrations: JSON.stringify({}),
    isSubscribed: false,
    isClub: isClub,
    clubMembers: isClub ? JSON.stringify([]) : '',
    clubMembersOnly: isClub ? false : (document.getElementById('club-members-only')?.checked || false),
    createdAt: new Date().toISOString()
  };

  const createResult = window.dataSdk ? await window.dataSdk.create(newEvent) : { isOk: true };
  
  if (createResult.isOk) {
    if(!window.dataSdk) state.allEvents.push(newEvent); // Fallback if no SDK
    closeCreateModal();
    if (isClub) {
      state.currentTab = 'organizations';
    }
    renderApp();
  } else {
    const config = window.elementSdk?.config || defaultConfig;
    const errorModal = document.createElement('div');
    errorModal.className = 'fixed inset-0 flex items-center justify-center p-4';
    errorModal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1001;';
    errorModal.innerHTML = `
      <div class="rounded-xl p-6 max-w-sm" style="background: ${config.background_color}; border: 1px solid #e5e7eb;">
        <p class="mb-4" style="color: ${config.text_color};">Failed to create ${isClub ? 'club' : 'event'}. Please try again.</p>
        <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${config.primary_action}; color: ${config.background_color};">OK</button>
      </div>
    `;
    document.body.appendChild(errorModal);
  }

  createBtn.disabled = false;
  createBtn.textContent = isClub ? 'Create organization' : 'Create event';
}

// --- Question Management ---

export function openQuestionsModal() {
  document.getElementById('questions-modal').classList.remove('hidden');
  renderQuestionsList();
}

export function closeQuestionsModal() {
  document.getElementById('questions-modal').classList.add('hidden');
}

export function closeQuestionsModalOnBackdrop(event) {
  if (event.target.id === 'questions-modal') {
    closeQuestionsModal();
  }
}

export function saveQuestions() {
  closeQuestionsModal();
}

export function addQuestion() {
  const newQuestion = {
    id: Date.now().toString(),
    question: '',
    required: false,
    yesNoType: false
  };
  state.eventQuestions.push(newQuestion);
  renderQuestionsList();
}

export function removeQuestion(questionId) {
  state.eventQuestions = state.eventQuestions.filter(q => q.id !== questionId);
  renderQuestionsList();
}

export function updateQuestion(questionId, field, value) {
  const question = state.eventQuestions.find(q => q.id === questionId);
  if (question) {
    question[field] = value;
  }
}

export function renderQuestionsList() {
  const config = window.elementSdk?.config || defaultConfig;
  const baseSize = config.font_size || defaultConfig.font_size;
  const isDarkMode = config.dark_mode || false;
  const surfaceColor = isDarkMode ? "#2d2d2d" : (config.surface_color || defaultConfig.surface_color);
  const textColor = isDarkMode ? "#ffffff" : (config.text_color || defaultConfig.text_color);
  const secondaryAction = isDarkMode ? "#9ca3af" : (config.secondary_action || defaultConfig.secondary_action);

  const questionsList = document.getElementById('questions-list');
  if (!questionsList) return;

  questionsList.innerHTML = state.eventQuestions.map((q, index) => `
    <div class="p-4 rounded-lg" style="background: ${surfaceColor}; border: 1px solid #e5e7eb;">
      <div class="flex items-start justify-between mb-3">
        <span class="font-medium" style="color: ${textColor}; font-size: ${baseSize * 0.93}px;">Question ${index + 1}</span>
        <button type="button" onclick="removeQuestion('${q.id}')" style="color: ${secondaryAction}; font-size: 18px;">×</button>
      </div>
      <input 
        type="text" 
        placeholder="Enter your question"
        value="${q.question || ''}"
        onchange="updateQuestion('${q.id}', 'question', this.value)"
        class="w-full px-3 py-2 rounded-lg mb-3" 
        style="background: ${isDarkMode ? '#1a1a1a' : '#ffffff'}; color: ${textColor}; border: 1px solid #e5e7eb; font-size: ${baseSize * 0.87}px;">
      <div class="space-y-2">
        <label class="flex items-center cursor-pointer" style="font-size: ${baseSize * 0.87}px; color: ${textColor};">
          <input 
            type="checkbox" 
            ${q.required ? 'checked' : ''}
            onchange="updateQuestion('${q.id}', 'required', this.checked)"
            class="mr-2">
          Mandatory question
        </label>
        <label class="flex items-center cursor-pointer" style="font-size: ${baseSize * 0.87}px; color: ${textColor};">
          <input 
            type="checkbox" 
            ${q.yesNoType ? 'checked' : ''}
            onchange="updateQuestion('${q.id}', 'yesNoType', this.checked)"
            class="mr-2">
          Answer as Yes or No
        </label>
      </div>
    </div>
  `).join('');
}
