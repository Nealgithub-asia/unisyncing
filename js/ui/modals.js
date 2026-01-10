import { config, getTheme } from '../config.js';
import { state } from '../state.js';
import { 
    handleSignup, 
    handleCreateEvent, 
    handleRegistration, 
    handleClubApplication,
    addQuestion,
    removeQuestion,
    updateQuestion,
    saveQuestions 
} from '../app.js'; // We will ensure these are exported from app.js or actions

export function renderModals() {
  const theme = getTheme(state.darkMode);
  const modalsContainer = document.getElementById('modals-container');
  
  if (!modalsContainer) return;

  // --- 1. Signup Modal with Google Button ---
  const signupModalHTML = `
    <div id="signup-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeSignupModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-md w-full slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Sign up</h3>
        
        <!-- Google Sign-In Button -->
        <button 
          onclick="handleGoogleLogin()" 
          class="w-full mb-4 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <div class="flex items-center gap-2 mb-4">
          <div class="h-px bg-gray-300 flex-1"></div>
          <span class="text-sm text-gray-500">OR</span>
          <div class="h-px bg-gray-300 flex-1"></div>
        </div>

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
  `;

  // --- 2. Create Event Modal ---
  const createModalHTML = `
    <div id="create-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Create ${state.currentTab === 'organizations' ? 'organization' : 'event'}</h3>
        
        <form id="event-form" onsubmit="handleCreateEvent(event)">
          <div class="space-y-5">
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="title">${state.currentTab === 'organizations' ? 'Organization' : 'Event'} title</label>
              <input type="text" id="title" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Enter title">
            </div>
            
            <div id="organization-field" style="${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="organization">Organization</label>
               <input type="text" id="organization" ${state.currentTab === 'organizations' ? '' : 'required'} class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Organization Name">
            </div>
            
            <div>
              <label class="block mb-2 font-medium" style="font-size: ${theme.baseSize * 0.93}px; color: ${theme.textColor};" for="category">Category</label>
              <select id="category" required class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshop">Workshop</option>
                <option value="Social">Social</option>
                <option value="Career">Career</option>
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
              <textarea id="description" required rows="3" class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;" placeholder="Event details"></textarea>
            </div>
            
            <!-- This button was not working because openQuestionsModal wasn't globally accessible -->
            <button 
              type="button" 
              onclick="openQuestionsModal()"
              class="w-full px-4 py-2.5 rounded-lg font-medium"
              style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px; ${state.currentTab === 'organizations' ? 'display: none;' : ''}">
              + Add Registration Questions
            </button>
          </div>

          <div class="flex gap-3 mt-8">
            <button type="button" onclick="closeCreateModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
              Cancel
            </button>
            <button type="submit" id="create-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // --- 3. Questions Modal (Must be rendered to exist) ---
  const questionsModalHTML = `
    <div id="questions-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1001;" onclick="closeQuestionsModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Add Custom Questions</h3>
        
        <div id="questions-list" class="space-y-4 mb-4">
           <!-- Dynamic Questions go here -->
        </div>
        
        <button 
          type="button" 
          onclick="addQuestion()"
          class="w-full px-4 py-2.5 rounded-lg font-medium mb-6"
          style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">
          + Add New Question
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
  `;

  // --- 4. Event Details & Registration Modals ---
  const detailsModalHTML = `
    <div id="event-details-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeEventDetailsModalOnBackdrop(event)">
      <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
        <div id="event-details-content"></div>
      </div>
    </div>
    
    <div id="registration-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeRegistrationModalOnBackdrop(event)">
       <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
          <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Register</h3>
          <form id="registration-form" onsubmit="handleRegistration(event)">
             <div id="registration-questions" class="space-y-4 mb-4"></div>
             <div class="flex gap-3 mt-8">
                <button type="button" onclick="closeRegistrationModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.93}px;">Cancel</button>
                <button type="submit" id="register-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;">Confirm Registration</button>
             </div>
          </form>
       </div>
    </div>

    <div id="club-application-modal" class="hidden fixed inset-0 modal-backdrop flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.4); z-index: 1000;" onclick="closeClubApplicationModalOnBackdrop(event)">
        <div class="rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto slide-in" style="background: ${theme.backgroundColor}; border: 1px solid #e5e7eb;" onclick="event.stopPropagation()">
          <h3 class="font-bold mb-6" style="font-size: ${theme.baseSize * 1.6}px; color: ${theme.textColor};">Apply to Organization</h3>
          <form id="club-application-form" onsubmit="handleClubApplication(event)">
            <div class="space-y-4">
                <input type="text" id="app-name" required placeholder="Full Name" class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb;">
                <input type="email" id="app-email" required placeholder="Email" class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb;">
                <textarea id="app-reason" required rows="3" placeholder="Why do you want to join?" class="w-full px-4 py-2.5 rounded-lg" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb;"></textarea>
            </div>
            <div class="flex gap-3 mt-8">
              <button type="button" onclick="closeClubApplicationModal()" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb;">Cancel</button>
              <button type="submit" id="apply-btn" class="flex-1 px-4 py-2.5 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor};">Submit</button>
            </div>
          </form>
        </div>
    </div>
  `;

  // Inject into DOM
  modalsContainer.innerHTML = signupModalHTML + createModalHTML + questionsModalHTML + detailsModalHTML;
}
