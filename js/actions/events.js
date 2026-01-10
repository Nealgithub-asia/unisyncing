import { state } from '../state.js';
import { renderApp } from '../ui/appShell.js';
import { config as defaultConfig } from '../config.js';
import { formatDate } from '../utils.js';
import { addEventToFirebase, updateEventInFirebase } from '../storage.js';

// --- Create Event Logic ---

export async function handleCreateEvent(e, questions) {
  e.preventDefault();
  
  const createBtn = document.getElementById('create-btn');
  if(createBtn) {
      createBtn.disabled = true;
      createBtn.textContent = "Creating...";
  }

  const isClub = state.currentTab === 'organizations';
  
  const newEvent = {
    title: document.getElementById('title').value,
    organization: isClub ? document.getElementById('title').value : document.getElementById('organization').value,
    category: document.getElementById('category').value,
    date: isClub ? '' : document.getElementById('date').value,
    time: isClub ? '' : document.getElementById('time').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    questions: JSON.stringify(questions || []), // Save the questions passed from app.js
    registrations: JSON.stringify({}),
    isSubscribed: false,
    isClub: isClub,
    clubMembers: JSON.stringify([]),
    createdAt: new Date().toISOString()
  };

  const success = await addEventToFirebase(newEvent);
  
  if (success) {
    if(window.closeCreateModal) window.closeCreateModal();
    if (isClub) window.switchTab('organizations');
  } else {
    alert("Error creating item");
  }

  if(createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = "Create";
  }
}

// --- Questions Logic ---

export function addQuestion() {
    // This is purely UI state, handled in app.js usually, but we can define the object structure here
    return { id: Date.now(), question: '', required: false, yesNoType: false };
}

// --- Registration Logic ---

export function registerForEvent(eventId) {
  openRegistrationModal(eventId);
}

export function openRegistrationModal(eventId) {
  state.currentRegistrationEventId = eventId;
  const modal = document.getElementById('registration-modal');
  if(!modal) return;
  
  modal.classList.remove('hidden');
  
  const container = document.getElementById('registration-questions');
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

  const questions = event.questions ? JSON.parse(event.questions) : [];
  
  if (questions.length === 0) {
      container.innerHTML = `<p class="text-gray-500">No specific questions. Click confirm to proceed.</p>`;
  } else {
      container.innerHTML = questions.map((q, index) => {
        if (q.yesNoType) {
          return `
            <div>
              <label class="block mb-2 font-medium">${q.question || q.text}${q.required ? ' *' : ''}</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="q-${index}" value="Yes" ${q.required ? 'required' : ''}> Yes
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="q-${index}" value="No" ${q.required ? 'required' : ''}> No
                </label>
              </div>
            </div>
          `;
        } else {
          return `
            <div>
              <label class="block mb-2 font-medium">${q.question || q.text}${q.required ? ' *' : ''}</label>
              <input type="text" name="q-${index}" ${q.required ? 'required' : ''} class="w-full px-4 py-2 rounded-lg border" placeholder="Your answer">
            </div>
          `;
        }
      }).join('');
  }
}

export async function handleRegistration(e) {
  e.preventDefault();
  
  const eventId = state.currentRegistrationEventId;
  const event = state.allEvents.find(ev => ev.id === eventId);
  if (!event) return;

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.textContent = "Processing...";

  // 1. Gather Answers (Mock logic for now, ideally save these)
  // const formData = new FormData(e.target); 
  
  // 2. Update Backend
  if (event.isClub) {
      const members = event.clubMembers ? JSON.parse(event.clubMembers) : [];
      members.push({ userId: state.currentUser?.uid || 'anon', joinedAt: new Date().toISOString() });
      await updateEventInFirebase(event.id, { clubMembers: JSON.stringify(members) });
  } else {
      const regs = event.registrations ? JSON.parse(event.registrations) : {};
      regs[state.currentUser?.uid || 'anon'] = { registeredAt: new Date().toISOString() };
      await updateEventInFirebase(event.id, { 
          registrations: JSON.stringify(regs),
          isSubscribed: true // Local optimistic update helper
      });
  }

  // 3. UI Feedback
  if(window.closeRegistrationModal) window.closeRegistrationModal();
  btn.disabled = false;
}

export function unregisterFromEvent(eventId) {
    const event = state.allEvents.find(e => e.id === eventId);
    if (!event) return;

    // Use Custom Modal if available, else fallback
    if (window.openConfirmModal) {
        window.openConfirmModal(`Unregister from ${event.title}?`, async () => {
            const regs = event.registrations ? JSON.parse(event.registrations) : {};
            const uid = state.currentUser?.uid || 'anon';
            if (regs[uid]) delete regs[uid];
            
            await updateEventInFirebase(event.id, { 
                registrations: JSON.stringify(regs),
                isSubscribed: false 
            });
        });
    } else {
        if(confirm("Unregister?")) {
             // ... same logic
        }
    }
}
