import { state } from '../state.js';
import { saveData } from '../storage.js';
import { renderApp } from '../ui/appShell.js';
import { openRegistrationModal } from './events.js';

export function joinClub(clubName) {
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
    let category = 'Social';
    if (clubName.includes('Computer') || clubName.includes('IEEE')) category = 'Academic';
    if (clubName.includes('Sports')) category = 'Sports';
    if (clubName.includes('Drama')) category = 'Cultural';
    if (clubName.includes('Debate')) category = 'Academic';

    club = {
      id: Date.now().toString(),
      title: clubName,
      organization: clubName,
      category: category,
      date: '',
      time: '',
      location: 'Main Campus',
      description: `Official ${clubName} of the college`,
      questions: JSON.stringify(applicationQuestions),
      registrations: JSON.stringify({}),
      isSubscribed: false,
      isClub: true,
      clubMembers: JSON.stringify([]),
      createdAt: new Date().toISOString()
    };
    state.allEvents.push(club);
  } else {
    // Ensure existing clubs have the questions if they try to join
    if (!club.questions || club.questions === '[]') {
      club.questions = JSON.stringify(applicationQuestions);
    }
  }

  // Open the modal to ask questions instead of immediate join
  openRegistrationModal(club.id);
}

export function leaveClub(clubName) {
  const club = state.allEvents.find(e => e.isClub && e.title === clubName);
  if (!club) return;

  const members = club.clubMembers ? JSON.parse(club.clubMembers) : [];
  const filteredMembers = members.filter(m => m.userId !== 'currentUser');
  club.clubMembers = JSON.stringify(filteredMembers);

  saveData();
  renderApp();
}