import { state } from '../state.js';
import { addEventToFirestore, updateEventInFirestore } from '../storage.js';

export function openClubApplicationModal(clubName) {
  if (!state.currentUser) {
    alert("Please sign in to join organizations.");
    return;
  }
  // Set the club we are applying to in the state or a global variable
  state.selectedOrganizationForApp = clubName;
  
  // Show the modal
  const modal = document.getElementById('club-application-modal');
  if (modal) modal.classList.remove('hidden');
}

export function closeClubApplicationModal() {
  document.getElementById('club-application-modal').classList.add('hidden');
  document.getElementById('club-application-form').reset();
}

export function closeClubApplicationModalOnBackdrop(e) {
  if (e.target.id === 'club-application-modal') closeClubApplicationModal();
}

export async function handleClubApplication(event) {
  event.preventDefault();
  const clubName = state.selectedOrganizationForApp;
  const club = state.allEvents.find(e => e.isClub && e.title === clubName);
  
  if (!club || !state.currentUser) return;

  const btn = document.getElementById('apply-btn');
  btn.textContent = 'Submitting...'; btn.disabled = true;

  // Add member to club
  const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  if (!members.some(m => m.userId === state.currentUser.uid)) {
    members.push({
        userId: state.currentUser.uid,
        joinedAt: new Date().toISOString(),
        status: 'pending', // Mark as pending application
        applicationData: {
            reason: document.getElementById('app-reason').value,
            name: document.getElementById('app-name').value,
            email: document.getElementById('app-email').value
        }
    });
    
    await updateEventInFirestore(club.id, { clubMembers: JSON.stringify(members) });
  }

  closeClubApplicationModal();
  alert("Application submitted!");
  btn.disabled = false;
  btn.textContent = 'Submit';
}

// Keep existing leave logic
export async function leaveClub(clubName) {
  if (!state.currentUser) return;
  const club = state.allEvents.find(e => e.isClub && e.title === clubName);
  if (!club) return;
  const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  const filtered = members.filter(m => m.userId !== state.currentUser.uid);
  await updateEventInFirestore(club.id, { clubMembers: JSON.stringify(filtered) });
}

// Deprecated direct join (kept for safety but not used in UI)
export async function joinClub(clubName) { openClubApplicationModal(clubName); }
