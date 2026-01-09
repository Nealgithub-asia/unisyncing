import { config, getTheme } from '../config.js';
import { state } from '../state.js';
import { CATEGORIES, ORGANIZATIONS } from '../data/constants.js';

export function renderQuestionsList() {
  const theme = getTheme(state.darkMode);
  const questionsList = document.getElementById('questions-list');
  if (!questionsList) return;

  questionsList.innerHTML = state.eventQuestions.map((q, index) => `
    <div class="p-4 rounded-lg" style="background: ${theme.surfaceColor}; border: 1px solid #e5e7eb;">
      <div class="flex items-start justify-between mb-3">
        <span class="font-medium" style="color: ${theme.textColor}; font-size: ${theme.baseSize * 0.93}px;">Question ${index + 1}</span>
        <button type="button" onclick="removeQuestion('${q.id}')" style="color: ${theme.secondaryAction}; font-size: 18px;">×</button>
      </div>
      <input 
        type="text" 
        placeholder="Enter your question"
        value="${q.question || ''}"
        onchange="updateQuestion('${q.id}', 'question', this.value)"
        class="w-full px-3 py-2 rounded-lg mb-3" 
        style="background: ${state.darkMode ? '#1a1a1a' : '#ffffff'}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.87}px;">
      <div class="space-y-2">
        <label class="flex items-center cursor-pointer" style="font-size: ${theme.baseSize * 0.87}px; color: ${theme.textColor};">
          <input 
            type="checkbox" 
            ${q.required ? 'checked' : ''}
            onchange="updateQuestion('${q.id}', 'required', this.checked)"
            class="mr-2">
          Mandatory question
        </label>
        <label class="flex items-center cursor-pointer" style="font-size: ${theme.baseSize * 0.87}px; color: ${theme.textColor};">
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

export function renderModals() {
  const theme = getTheme(state.darkMode);
  
  // Existing modals + New Registration and Details modals
  const modalsHTML = `
    <div id="signup-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeSignupModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-md w-full slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Sign up</h3>
        <form id="signup-form" onsubmit="handleSignup(event)">
          <div class="space-y-5">
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="signup-name">Full name</label>
              <input type="text" id="signup-name" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Enter your name">
            </div>
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="signup-email">Email</label>
              <input type="email" id="signup-email" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Enter your email">
            </div>
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="signup-password">Password</label>
              <input type="password" id="signup-password" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Create a password">
            </div>
          </div>
          <div class="flex gap-3 mt-8">
            <button type="button" onclick="closeSignupModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              Cancel
            </button>
            <button type="submit" id="signup-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>

    <div id="create-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Create ${state.currentTab === 'organizations' ? 'organization' : 'event'}</h3>
        
        <form id="event-form" onsubmit="handleCreateEvent(event)">
          <div class="space-y-5">
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="title">${state.currentTab === 'organizations' ? 'Organization' : 'Event'} title</label>
              <input type="text" id="title" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Enter ${state.currentTab === 'organizations' ? 'organization' : 'event'} title">
            </div>
            <div id="organization-field" style="${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="organization">Organization</label>
              <select id="organization" ${state.currentTab === 'organizations' ? '' : 'required'} class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
                ${ORGANIZATIONS.slice(1).map(org => `<option value="${org}">${org}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="category">Category</label>
              <select id="category" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
                ${CATEGORIES.slice(1).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4" id="datetime-fields" style="${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              <div>
                <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="date">Date</label>
                <input type="date" id="date" ${state.currentTab === 'organizations' ? '' : 'required'} class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              </div>
              <div>
                <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="time">Time</label>
                <input type="time" id="time" ${state.currentTab === 'organizations' ? '' : 'required'} class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              </div>
            </div>
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="location">Location</label>
              <input type="text" id="location" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Enter location">
            </div>
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="description">Description</label>
              <textarea id="description" required rows="3" class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="${state.currentTab === 'organizations' ? 'Organization' : 'Event'} details"></textarea>
            </div>
            <div id="club-members-field" style="${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              <label class="flex items-center cursor-pointer" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};">
                <input type="checkbox" id="club-members-only" class="mr-3" style="width: 18px; height: 18px; cursor: pointer;">
                Only for organization members
              </label>
            </div>
            <button type="button" onclick="openQuestionsModal()" class="w-full px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px; ${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              Add questions
            </button>
          </div>
          <div class="flex gap-3 mt-8">
            <button type="button" onclick="closeCreateModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              Cancel
            </button>
            <button type="submit" id="create-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">
              Create ${state.currentTab === 'organizations' ? 'organization' : 'event'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div id="questions-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1001;" onclick="closeQuestionsModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Add Questions</h3>
        <div id="questions-list" class="space-y-4 mb-4"></div>
        <button type="button" onclick="addQuestion()" class="w-full px-4 py-2.5 rounded-lg font-medium mb-6" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
          + Add Question
        </button>
        <div class="flex gap-3">
          <button type="button" onclick="closeQuestionsModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
            Cancel
          </button>
          <button type="button" onclick="saveQuestions()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">
            Save
          </button>
        </div>
      </div>
    </div>

    <div id="registration-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeRegistrationModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Register for Event</h3>
        <form id="registration-form" onsubmit="handleRegistration(event)">
          <div id="registration-questions" class="space-y-5">
            </div>
          <div class="flex gap-3 mt-8">
            <button type="button" onclick="closeRegistrationModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              Cancel
            </button>
            <button type="submit" id="register-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>

    <div id="event-details-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeEventDetailsModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <div id="event-details-content">
          </div>
      </div>
    </div>
  `;

  document.getElementById('modals-container').innerHTML = modalsHTML;
}

export function showSimpleMessage(message) {
  const theme = getTheme(state.darkMode);
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center p-4';
  modal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1003;';
  modal.innerHTML = `
    <div class="rounded-xl p-6 max-w-sm slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;">
      <p class="mb-4" style="color: ${theme.textColor}; font-size: ${theme.baseSize}px;">${message}</p>
      <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor};">OK</button>
    </div>
  `;
  document.body.appendChild(modal);
}
