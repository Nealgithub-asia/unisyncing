import { state } from '../state.js';
import { addEventToFirestore, updateEventInFirestore } from '../storage.js';
import { renderApp } from '../ui/appShell.js';
import { openRegistrationModal } from './events.js';

export async function joinClub(clubName) {
  if (!state.currentUser) {
    alert("Please sign in to join clubs.");
    return;
  }

  let club = state.allEvents.find(e => e.isClub && e.title === clubName);
  
  // Questions for the club application
  const applicationQuestions = [
    { id: 'fullname', question: 'Full Name', required: true, yesNoType: false },
    { id: 'studentId', question: 'Student ID', required: true, yesNoType: false },
    { id: 'department', question: 'Department', required: true, yesNoType: false },
    { id: 'year', question: 'Year of Study', required: true, yesNoType: false },
    { id: 'reason', question: 'Why do you want to join this organization?', required: true, yesNoType: false }
  ];

  if (!club) {
    // Create new club if it doesn't exist yet
    let category = 'Social';
    if (clubName.includes('Computer') || clubName.includes('IEEE')) category = 'Academic';
    if (clubName.includes('Sports')) category = 'Sports';
    if (clubName.includes('Drama')) category = 'Cultural';
    if (clubName.includes('Debate')) category = 'Academic';

    const newClub = {
      title: clubName,
      organization: clubName,
      category: category,
      description: `Official ${clubName} of the college`,
      isClub: true,
      clubMembers: JSON.stringify([{ 
        userId: state.currentUser.uid, 
        joinedAt: new Date().toISOString() 
      }]),
      createdAt: new Date().toISOString(),
      creatorId: state.currentUser.uid
    };
    await addEventToFirestore(newClub);
  } else {
    // Join existing club
    const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
    
    // Check if already member
    if (members.some(m => m.userId === state.currentUser.uid)) return;

    members.push({ 
      userId: state.currentUser.uid, 
      joinedAt: new Date().toISOString() 
    });

    await updateEventInFirestore(club.id, {
      clubMembers: JSON.stringify(members)
    });
  }
}

export async function leaveClub(clubName) {
  if (!state.currentUser) return;

  const club = state.allEvents.find(e => e.isClub && e.title === clubName);
  if (!club) return;

  const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  const filteredMembers = members.filter(m => m.userId !== state.currentUser.uid);

  await updateEventInFirestore(club.id, {
    clubMembers: JSON.stringify(filteredMembers)
  });
}