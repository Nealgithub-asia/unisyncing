import { state } from '../state.js';
import { renderApp } from '../ui/appShell.js';
import { config as defaultConfig } from '../config.js';
import { formatDate } from '../utils.js';
import { addEventToFirestore, updateEventInFirestore } from '../storage.js';

// --- Registration Logic ---

export function registerForEvent(eventId) {
  if (!state.currentUser) {
    alert("Please sign in to register for events.");
    return;
  }
  openRegistrationModal(eventId);
}

export function openRegistrationModal(eventId) {
  state.currentRegistrationEventId = eventId;
  const modal = document.getElementById('registration-modal');
  if (modal) modal.classList.remove('hidden');
  
  const container = document.getElementById('registration-questions');
  if (!container) return;

  const config = window.elementSdk?.config || defaultConfig;
  const isDarkMode = config.dark_mode || false;
  const surfaceColor = isDarkMode ? "#2d2d2d" : (config.surface_color || defaultConfig.surface_color);
  const textColor = isDarkMode ? "#ffffff" : (config.text_color || defaultConfig.text_color);

  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  // Update header based on type
  const titleEl = document.querySelector('#registration-modal h3');
  if (titleEl) {
    titleEl.textContent = event.isClub ? 'Apply to Join Organization' : 'Register for Event';
  }
  
  // Update button text
  const btnEl = document.getElementById('register-btn');
  if (btnEl) {
    btnEl.textContent = event.isClub ? 'Submit Application' : 'Register';
  }

  if (event.isClub) {
    container.innerHTML = `
      <div class="space-y-5">
        <div><label class="block mb-2 font-medium">Full Name *</label><input type="text" name="name" required class="w-full px-4 py-2.5 rounded-lg border" style="background:${surfaceColor};color:${textColor}"></div>
        <div><label class="block mb-2 font-medium">Why do you want to join? *</label><textarea name="reason" required rows="3" class="w-full px-4 py-2.5 rounded-lg border" style="background:${surfaceColor};color:${textColor}"></textarea></div>
      </div>`;
  } else {
    const questions = event.questions ? JSON.parse(event.questions) : [];
    if (questions.length === 0) {
      container.innerHTML = `<p style="color: ${textColor};">Confirm registration for <strong>${event.title}</strong>?</p>`;
    } else {
      container.innerHTML = questions.map(q => `
        <div>
          <label class="block mb-2 font-medium">${q.question} ${q.required ? '*' : ''}</label>
          ${q.yesNoType 
            ? `<select name="${q.id}" ${q.required ? 'required' : ''} class="w-full px-4 py-2.5 rounded-lg border" style="background:${surfaceColor};color:${textColor}"><option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option></select>`
            : `<input type="text" name="${q.id}" ${q.required ? 'required' : ''} class="w-full px-4 py-2.5 rounded-lg border" style="background:${surfaceColor};color:${textColor}">`
          }
        </div>
      `).join('');
    }
  }
}

export function closeRegistrationModal() {
  document.getElementById('registration-modal').classList.add('hidden');
  document.getElementById('registration-form').reset();
  state.currentRegistrationEventId = null;
}

export function closeRegistrationModalOnBackdrop(event) {
  if (event.target.id === 'registration-modal') closeRegistrationModal();
}

export async function handleRegistration(event) {
  event.preventDefault();
  const eventId = state.currentRegistrationEventId;
  const eventToUpdate = state.allEvents.find(e => e.id === eventId);
  if (!eventToUpdate || !state.currentUser) return;

  const btn = document.getElementById('register-btn');
  btn.textContent = 'Processing...'; btn.disabled = true;

  if (eventToUpdate.isClub) {
    if (eventToUpdate.domain && state.currentUser.email && state.currentUser.email.split('@')[1] !== eventToUpdate.domain) {
      alert(`You must have a @${eventToUpdate.domain} email address to join this organization.`);
      btn.textContent = 'Submit Application';
      btn.disabled = false;
      return;
    }
    const members = eventToUpdate.clubMembers ? JSON.parse(eventToUpdate.clubMembers) : [];
    const nameInput = document.querySelector('input[name="name"]');
    const reasonInput = document.querySelector('textarea[name="reason"]');
    
    members.push({
      userId: state.currentUser.uid,
      email: state.currentUser.email,
      name: nameInput ? nameInput.value : (state.currentUser.displayName || state.currentUser.email),
      reason: reasonInput ? reasonInput.value : '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    });
    await updateEventInFirestore(eventId, { clubMembers: JSON.stringify(members) });
    alert("Application submitted for admin review!");
  } else {
    const registrations = eventToUpdate.registrations ? JSON.parse(eventToUpdate.registrations) : {};
    registrations[state.currentUser.uid] = {
      userId: state.currentUser.uid,
      userName: state.currentUser.displayName || state.currentUser.email,
      registeredAt: new Date().toISOString()
    };
    await updateEventInFirestore(eventId, { registrations: JSON.stringify(registrations) });
  }

  closeRegistrationModal();
  btn.disabled = false;
}

// --- Event Details & Unregister ---

export function openEventDetails(eventId) {
  state.selectedEventForDetails = eventId;
  const event = state.allEvents.find(e => e.id === eventId);
  if (event) {
    // We assume renderEventDetailsModalContent is handled in ui/modals.js or similar, 
    // but for simplicity we rely on the global renderApp or simple toggle here.
    // Since the original code had the renderer here, we simply toggle the class.
    // Note: The content rendering logic is often better placed in UI files, but we keep the toggle here.
    const modal = document.getElementById('event-details-modal');
    if(modal) {
        modal.classList.remove('hidden');
        // Trigger a re-render of details if needed, or assume UI handles it.
        // For this specific codebase, we need to manually populate it if not done elsewhere.
        // (Assuming the user's existing renderEventDetailsModalContent is sufficient or imported)
    }
    // To ensure content is there:
    import('../ui/modals.js').then(m => {
        // This is a dynamic fix to call the renderer if it was moved. 
        // If it's not exported there, we just rely on state. 
    });
    // RENDER LOGIC (Restored from previous version to ensure it works):
     renderEventDetailsModalContent(event);
  }
}

// Helper to render details (Restored)
function renderEventDetailsModalContent(event) {
  const container = document.getElementById('event-details-content');
  if(!container) return;
  
  const isSubscribed = state.currentUser && event.registrations && JSON.parse(event.registrations)[state.currentUser.uid];
  const config = defaultConfig; // Simplified config access
  
  let adminHtml = '';
  if (event.isClub && state.currentUser && event.admins?.includes(state.currentUser.email)) {
    const members = event.clubMembers ? JSON.parse(event.clubMembers) : [];
    const pendingMembers = members.filter(m => m.status === 'pending');
    const activeMembers = members.filter(m => m.status === 'approved');
    
    // Pending events for this club
    const pendingEvents = state.allEvents.filter(e => !e.isClub && e.organization === event.title && e.approvalStatus === 'pending');

    adminHtml = `
      <div class="mt-6 border-t pt-4">
        <h4 class="font-bold text-lg mb-3" style="color: ${config.text_color}">Admin Dashboard</h4>
        
        <div class="mb-4 bg-white p-3 rounded border">
          <details>
            <summary class="font-semibold text-md cursor-pointer select-none" style="color: ${config.text_color}">Active Members (${activeMembers.length})</summary>
            <div class="mt-3 space-y-2">
              ${activeMembers.map(m => {
                const mIsAdmin = event.admins?.includes(m.email);
                return `
                <div class="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                  <div>
                    <p class="font-medium text-sm text-gray-900">${m.name} ${mIsAdmin ? '<span class="text-xs text-blue-600 font-bold ml-1">(Admin)</span>' : ''}</p>
                    <p class="text-xs text-gray-500">${m.email}</p>
                  </div>
                  <div class="flex gap-2">
                    ${!mIsAdmin ? `<button onclick="promoteToAdmin('${event.id}', '${m.email}')" class="px-2 py-1 bg-gray-800 text-white rounded text-xs hover:bg-black">Make Admin</button>` : ''}
                    <button onclick="removeMember('${event.id}', '${m.userId}')" class="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Remove</button>
                  </div>
                </div>
                `;
              }).join('')}
              ${activeMembers.length === 0 ? '<p class="text-sm text-gray-500">No active members yet.</p>' : ''}
            </div>
          </details>
        </div>

        <div class="mb-4">
          <h5 class="font-semibold text-md mb-2" style="color: ${config.text_color}">Pending Members (${pendingMembers.length})</h5>
          ${pendingMembers.map(m => `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded mb-2 border border-gray-200">
              <div>
                <p class="font-medium text-sm text-gray-900">${m.name}</p>
                <p class="text-xs text-gray-500">${m.email}</p>
                <p class="text-xs italic text-gray-600 mt-1">"${m.reason}"</p>
              </div>
              <button onclick="approveMember('${event.id}', '${m.userId}')" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Approve</button>
            </div>
          `).join('')}
          ${pendingMembers.length === 0 ? '<p class="text-sm text-gray-500">No pending members.</p>' : ''}
        </div>

        <div class="mb-4">
          <h5 class="font-semibold text-md mb-2" style="color: ${config.text_color}">Pending Events (${pendingEvents.length})</h5>
          ${pendingEvents.map(e => `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded mb-2 border border-gray-200">
              <div>
                <p class="font-medium text-sm text-gray-900">${e.title}</p>
                <p class="text-xs text-gray-500">${e.date} at ${e.time}</p>
              </div>
              <button onclick="approveEvent('${e.id}')" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Approve</button>
            </div>
          `).join('')}
          ${pendingEvents.length === 0 ? '<p class="text-sm text-gray-500">No pending events.</p>' : ''}
        </div>

        <div class="mb-2">
          <h5 class="font-semibold text-md mb-2" style="color: ${config.text_color}">Add Admin</h5>
          <div class="flex gap-2">
            <input type="email" id="new-admin-email" placeholder="Admin Email" class="flex-1 p-2 border rounded text-sm text-gray-900 bg-white">
            <button onclick="assignAdmin('${event.id}')" class="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-black">Add</button>
          </div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = `
    <h3 class="font-bold mb-2 text-2xl" style="color: ${config.text_color}">${event.title}</h3>
    <p class="mb-4 text-gray-500">${event.organization}</p>
    <p class="mb-6" style="color: ${config.text_color}">${event.description}</p>
    <div class="flex gap-3">
        <button onclick="closeEventDetailsModal()" class="flex-1 px-4 py-2 border rounded-lg" style="color: ${config.text_color}">Close</button>
        ${isSubscribed 
            ? `<button onclick="unregisterFromEvent('${event.id}')" class="flex-1 px-4 py-2 bg-black text-white rounded-lg">Unregister</button>`
            : `<button onclick="openRegistrationModalFromDetails('${event.id}')" class="flex-1 px-4 py-2 bg-black text-white rounded-lg">Register</button>`
        }
    </div>
    ${adminHtml}
  `;
}

export async function approveMember(clubId, userId) {
  const club = state.allEvents.find(e => e.id === clubId);
  if (!club) return;
  const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  const member = members.find(m => m.userId === userId);
  if (member) {
    member.status = 'approved';
    await updateEventInFirestore(clubId, { clubMembers: JSON.stringify(members) });
  }
}

export async function approveEvent(eventId) {
  await updateEventInFirestore(eventId, { approvalStatus: 'approved' });
}

export async function assignAdmin(clubId) {
  const emailInput = document.getElementById('new-admin-email');
  if (!emailInput || !emailInput.value) return;
  const newEmail = emailInput.value.trim();

  const club = state.allEvents.find(e => e.id === clubId);
  if (!club) return;

  const admins = club.admins || [];
  if (!admins.includes(newEmail)) {
    admins.push(newEmail);
    await updateEventInFirestore(clubId, { admins });
  }
  emailInput.value = '';
}

export async function promoteToAdmin(clubId, email) {
  const club = state.allEvents.find(e => e.id === clubId);
  if (!club) return;
  const admins = club.admins || [];
  if (!admins.includes(email)) {
    admins.push(email);
    await updateEventInFirestore(clubId, { admins });
  }
}

export async function removeMember(clubId, userId) {
  const club = state.allEvents.find(e => e.id === clubId);
  if (!club) return;
  
  let members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  const memberObj = members.find(m => m.userId === userId);
  
  // Remove from clubMembers
  members = members.filter(m => m.userId !== userId);
  await updateEventInFirestore(clubId, { clubMembers: JSON.stringify(members) });
  
  // Also remove from admins if they are an admin
  if (memberObj && club.admins && club.admins.includes(memberObj.email)) {
    const updatedAdmins = club.admins.filter(a => a !== memberObj.email);
    await updateEventInFirestore(clubId, { admins: updatedAdmins });
  }
}

export function openDiscoverEventDetails(eventId) { openEventDetails(eventId); }
export function closeEventDetailsModal() { document.getElementById('event-details-modal').classList.add('hidden'); }
export function closeEventDetailsModalOnBackdrop(e) { if(e.target.id === 'event-details-modal') closeEventDetailsModal(); }
export function openRegistrationModalFromDetails(id) { closeEventDetailsModal(); registerForEvent(id); }

export async function unregisterFromEvent(eventId) {
  if (!state.currentUser) return;
  // FIX: Removed the confirm() alert
  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  const registrations = event.registrations ? JSON.parse(event.registrations) : {};
  delete registrations[state.currentUser.uid];

  await updateEventInFirestore(eventId, { registrations: JSON.stringify(registrations) });
  closeEventDetailsModal();
}

export function confirmCancelRegistration(id) { unregisterFromEvent(id); }

// --- Create & Questions ---

export function openCreateModal() {
  if (!state.currentUser) { alert("Please sign in."); return; }
  state.eventQuestions = [];
  document.getElementById('create-modal').classList.remove('hidden');
}
export function closeCreateModal() { document.getElementById('create-modal').classList.add('hidden'); }
export function closeModalOnBackdrop(e) { if(e.target.id === 'create-modal') closeCreateModal(); }

export async function handleCreateEvent(event) {
  event.preventDefault();
  const btn = document.getElementById('create-btn');
  btn.disabled = true;

  const isClub = state.currentTab === 'organizations';
  const organizationName = isClub ? document.getElementById('title').value : document.getElementById('organization').value;
  
  let approvalStatus = 'approved';
  if (!isClub) {
    const parentOrg = state.allEvents.find(e => e.isClub && e.title === organizationName);
    if (parentOrg && (!parentOrg.admins || !parentOrg.admins.includes(state.currentUser.email))) {
      approvalStatus = 'pending';
    }
  }

  const newEvent = {
    title: document.getElementById('title').value,
    organization: organizationName,
    category: document.getElementById('category').value,
    date: isClub ? '' : document.getElementById('date').value,
    time: isClub ? '' : document.getElementById('time').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    questions: JSON.stringify(state.eventQuestions),
    registrations: JSON.stringify({}),
    isClub: isClub,
    clubMembers: isClub ? JSON.stringify([]) : '',
    domain: isClub ? (state.currentUser.email ? state.currentUser.email.split('@')[1] : null) : null,
    admins: isClub ? [state.currentUser.email] : null,
    creatorEmail: state.currentUser.email,
    approvalStatus: isClub ? 'approved' : approvalStatus,
    createdAt: new Date().toISOString(),
    creatorId: state.currentUser.uid
  };

  await addEventToFirestore(newEvent);
  closeCreateModal();
  btn.disabled = false;
  if (!isClub && approvalStatus === 'pending') {
    alert("Event submitted for admin review!");
  }
}

// FIX: Added the missing render function for questions
export function renderQuestionsList() {
  const list = document.getElementById('questions-list');
  if (!list) return;

  list.innerHTML = state.eventQuestions.map((q, index) => `
    <div class="p-3 mb-3 border rounded bg-gray-50">
      <div class="flex justify-between mb-2">
        <span class="font-medium">Question ${index + 1}</span>
        <button type="button" onclick="removeQuestion('${q.id}')" class="text-red-500 text-sm">Remove</button>
      </div>
      <input type="text" value="${q.question}" onchange="updateQuestion('${q.id}', 'question', this.value)" 
             class="w-full p-2 border rounded mb-2" placeholder="Enter question">
      <label class="flex items-center text-sm">
        <input type="checkbox" ${q.yesNoType ? 'checked' : ''} onchange="updateQuestion('${q.id}', 'yesNoType', this.checked)" class="mr-2">
        Yes/No Answer Only
      </label>
    </div>
  `).join('');
}

export function openQuestionsModal() { document.getElementById('questions-modal').classList.remove('hidden'); renderQuestionsList(); }
export function closeQuestionsModal() { document.getElementById('questions-modal').classList.add('hidden'); }
export function closeQuestionsModalOnBackdrop(e) { if(e.target.id === 'questions-modal') closeQuestionsModal(); }
export function saveQuestions() { closeQuestionsModal(); }
export function addQuestion() {
  state.eventQuestions.push({ id: Date.now().toString(), question: '', required: false, yesNoType: false });
  renderQuestionsList();
}
export function removeQuestion(id) {
  state.eventQuestions = state.eventQuestions.filter(q => q.id !== id);
  renderQuestionsList();
}
export function updateQuestion(id, field, value) {
  const q = state.eventQuestions.find(q => q.id === id);
  if (q) q[field] = value;
}
