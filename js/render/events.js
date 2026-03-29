import { state } from '../state.js';
import { getTheme } from '../config.js';
import { formatDate } from '../utils.js';

export function renderEventsList() {
  const theme = getTheme(state.darkMode);
  
  let filteredEvents = state.allEvents.filter(e => !e.isClub && e.approvalStatus !== 'pending');
  
  if (state.selectedCategory !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.category.toLowerCase() === state.selectedCategory);
  }
  
  if (state.selectedOrganization && state.selectedOrganization !== 'all' && state.selectedOrganization.trim() !== '') {
    filteredEvents = filteredEvents.filter(e => e.organization.toLowerCase().includes(state.selectedOrganization.toLowerCase().trim()));
  }

  if (filteredEvents.length === 0) {
    return `<div class="col-span-full text-center py-12"><p style="color: ${theme.secondaryAction}; font-size: ${theme.baseSize * 0.93}px;">No events found. Create your first event!</p></div>`;
  }

  return filteredEvents.map(event => `
    <div class="event-card rounded-xl p-5 cursor-pointer" style="background: ${theme.backgroundColor}; border-color: #e5e7eb;" onclick="openDiscoverEventDetails('${event.id}')">
      <div class="mb-3 flex gap-2 flex-wrap">
        <span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${event.category.toLowerCase() === 'academic' ? theme.primaryAction : theme.surfaceColor}; color: ${event.category.toLowerCase() === 'academic' ? theme.backgroundColor : theme.textColor}; font-size: ${theme.baseSize * 0.8}px;">${event.category}</span>
        ${event.clubMembersOnly ? `<span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.8}px;">Members Only</span>` : `<span class="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; font-size: ${theme.baseSize * 0.8}px;">Open to All</span>`}
      </div>
      <h3 class="font-semibold mb-2" style="font-size: ${theme.baseSize * 1.13}px; color: ${theme.textColor};">${event.title}</h3>
      <p class="mb-3" style="font-size: ${theme.baseSize * 0.87}px; color: ${theme.secondaryAction};">${event.organization}</p>
      <div class="space-y-1 mb-4" style="font-size: ${theme.baseSize * 0.87}px; color: ${theme.textColor};">
        <div style="display: flex; align-items: center;">
          <div style="width: 24px; display: flex; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z" fill="currentColor"/>
            </svg>
          </div>
          <span style="margin-left: 8px;">${formatDate(event.date)}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 24px; display: flex; justify-content: center;">
            <svg width="17.6" height="17.6" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(2 2)">
                <circle cx="8.5" cy="8.5" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 5.5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>
          </div>
          <span style="margin-left: 8px;">${event.time}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 24px; display: flex; justify-content: center;">
            <svg width="24.24" height="24.24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(4 2)">
                <path d="M6.5 16.54l-.71-.71a29.49 29.49 0 01-2.58-3.23 9.24 9.24 0 01-1.12-2.35 4.42 4.42 0 01-.19-1.42 5.3 5.3 0 01.31-1.65 4.68 4.68 0 012.27-2.72 4.84 4.84 0 011.67-.52 5.24 5.24 0 011.7 0 4.84 4.84 0 011.67.52A4.68 4.68 0 0112 7.18a5.3 5.3 0 01.31 1.65 4.42 4.42 0 01-.19 1.42 9.24 9.24 0 01-1.12 2.35 29.49 29.49 0 01-2.58 3.23z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="6.5" cy="8.5" r="2.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>
          </div>
          <span style="margin-left: 8px;">${event.location}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 24px; display: flex; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span style="margin-left: 8px;">${(() => {
            const registrations = event.registrations ? JSON.parse(event.registrations) : {};
            const regCount = Object.keys(registrations).length;
            return `${regCount} ${regCount === 1 ? 'person' : 'people'} registered`;
          })()}</span>
        </div>
      </div>
      ${event.isSubscribed ? `
        <button class="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2" style="background: ${theme.surfaceColor}; color: ${theme.textColor}; border: 1px solid #e5e7eb; font-size: ${theme.baseSize * 0.87}px;" onclick="event.stopPropagation(); confirmCancelRegistration('${event.id}')">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
          </svg>
          <span>Registered</span>
        </button>
      ` : `
        <button onclick="event.stopPropagation(); registerForEvent('${event.id}')" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.87}px;">
          Register
        </button>
      `}
    </div>
  `).join('');
}