import { state } from '../state.js';
import { getTheme } from '../config.js';
import { ORGANIZATIONS } from '../data/constants.js';

export function renderOrganizationsList() {
  const theme = getTheme(state.darkMode);
  
  const clubsFromData = state.allEvents.filter(e => e.isClub);
  const presetOrgs = ORGANIZATIONS.slice(1);
  const customClubs = clubsFromData.filter(club => !presetOrgs.includes(club.title));
  const allClubNames = [...presetOrgs, ...customClubs.map(c => c.title)];

  return allClubNames.map(clubName => {
    const existingClub = clubsFromData.find(e => e.title === clubName);
    const members = existingClub?.clubMembers ? JSON.parse(existingClub.clubMembers) : [];
    
    const activeMembers = members.filter(m => m.status !== 'pending');
    const memberCount = activeMembers.length;
    
    const currentUserRecord = state.currentUser ? members.find(m => m.userId === state.currentUser.uid) : null;
    const isApplied = currentUserRecord && currentUserRecord.status === 'pending';
    const isMember = currentUserRecord && !isApplied;

    let category = existingClub?.category || 'Social';
    if (!existingClub) {
      if (clubName.includes('Computer') || clubName.includes('IEEE')) category = 'Academic';
      if (clubName.includes('Sports')) category = 'Sports';
    }

    return `
    <div class="event-card rounded-xl p-5" style="background: ${theme.backgroundColor}; border-color: #e5e7eb;">
      <div class="mb-3">
        <span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor};">${category}</span>
      </div>
      <h3 class="font-semibold mb-2" style="font-size: ${theme.baseSize * 1.13}px; color: ${theme.textColor};">${clubName}</h3>
      <p class="mb-3" style="color: ${theme.secondaryAction};">Campus Organization</p>
      <div class="mb-4 text-sm" style="color: ${theme.textColor};">
        ${memberCount} ${memberCount === 1 ? 'member' : 'members'}
      </div>
      ${isMember ? `
        <button class="w-full px-4 py-2 rounded-lg font-medium border" style="color: ${theme.textColor};" onclick="leaveClub('${clubName}')">
          Leave
        </button>
      ` : isApplied ? `
        <button class="w-full px-4 py-2 rounded-lg font-medium border bg-gray-100" disabled>
          Applied
        </button>
      ` : `
        <button onclick="openClubApplicationModal('${clubName}')" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor};">
          Apply to Join
        </button>
      `}
    </div>
  `;
  }).join('');
}
