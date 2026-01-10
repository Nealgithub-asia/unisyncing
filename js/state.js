export const state = {
  allEvents: [],
  currentUser: null, // New: Tracks the logged-in user
  currentTab: 'discover',
  selectedCategory: 'all',
  selectedOrganization: 'all',
  darkMode: false,
  
  // Transient UI state
  eventQuestions: [],
  currentEditingEventId: null,
  selectedEventForDetails: null,
  currentRegistrationEventId: null
};

export function setState(key, value) {
  state[key] = value;
}