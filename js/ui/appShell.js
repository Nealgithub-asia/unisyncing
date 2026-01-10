import { config, getTheme } from '../config.js';
import { state } from '../state.js';
import { CATEGORIES } from '../data/constants.js';
import { renderEventsList } from '../render/events.js';
import { renderCalendarList } from '../render/calendar.js';
import { renderOrganizationsList } from '../render/organizations.js';
import { renderModals } from './modals.js';
import { handleGoogleLogin, handleLogout, openSignupModal } from '../actions/auth.js';

export function renderApp() {
  const theme = getTheme(state.darkMode);
  const baseFontStack = 'system-ui, -apple-system, sans-serif';
  const user = state.currentUser;

  // Augment events with "isSubscribed" based on current user
  if (state.allEvents) {
    state.allEvents.forEach(event => {
      if (event.registrations) {
        const regs = typeof event.registrations === 'string' ? JSON.parse(event.registrations) : event.registrations;
        event.isSubscribed = user && regs[user.uid] ? true : false;
      }
      // For clubs
      if (event.clubMembers) {
        const members = typeof event.clubMembers === 'string' ? JSON.parse(event.clubMembers) : event.clubMembers;
        // Logic for renderOrganizationsList usually checks specific member IDs, 
        // but we can help it by ensuring data consistency here if needed.
      }
    });
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="main-wrapper h-full flex flex-col" style="background: ${theme.backgroundColor}; color: ${theme.textColor}; font-family: ${config.font_family}, ${baseFontStack};">
      <!-- Header -->
      <header class="px-6 py-4 border-b" style="background: ${theme.backgroundColor}; border-color: #e5e7eb; position: relative; overflow: hidden;">
        <div style="position: absolute; inset: 0; background-image: url('https://www.dropbox.com/scl/fi/usgpx39i9lvee4b1nu80t/pawel-czerwinski-NTYYL9Eb9y8-unsplash.jpg?rlkey=49shzeu60vzc1cejkoftyi88m&st=fhtbs4q0&raw=1'); background-size: cover; background-position: center;"></div>
        <div class="flex items-center justify-between max-w-7xl mx-auto" style="position: relative;">
          <h1 class="font-bold tracking-tight" style="font-size: ${theme.baseSize * 2.16}px; color: #ffffff;">
            ${config.app_title}
          </h1>
          <div class="flex items-center gap-4">
            <button 
              class="create-button px-5 py-2 rounded-lg font-medium"
              style="background: ${theme.primaryAction}; color: ${theme.backgroundColor}; font-size: ${theme.baseSize * 0.93}px;"
              onclick="openCreateModal()">
              Create ${state.currentTab === 'organizations' ? 'organization' : 'event'}
            </button>
            
            ${user ? `
              <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white">
                    ${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                 </div>
                 <button 
                  onclick="handleLogout()"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors border border-white/40">
                  Logout
                </button>
              </div>
            ` : `
              <button 
                class="flex items-center justify-center rounded-full"
                style="width: 40px; height: 40px; border: 2px solid ${theme.primaryAction}; background: ${theme.backgroundColor};"
                onclick="openSignupModal()"
                title="Sign up / Login">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="${theme.primaryAction}"/>
                </svg>
              </button>
            `}
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="px-6 py-3 border-b" style="background: ${theme.backgroundColor}; border-color: #e5e7eb;">
        <div class="flex items-center justify-between max-w-7xl mx-auto">
          <div class="flex gap-6">
            <button 
              class="tab-button pb-2 font-medium relative"
              style="color: ${state.currentTab === 'discover' ? theme.primaryAction : theme.secondaryAction}; font-size: ${theme.baseSize * 0.93}px; border-bottom: ${state.currentTab === 'discover' ? '2px solid' : '2px solid transparent'}; border-color: ${state.currentTab === 'discover' ? theme.primaryAction : 'transparent'};"
              onclick="switchTab('discover')">
              ${config.discover_title}
            </button>
            <button 
              class="tab-button pb-2 font-medium relative"
              style="color: ${state.currentTab === 'calendar' ? theme.primaryAction : theme.secondaryAction}; font-size: ${theme.baseSize * 0.93}px; border-bottom: ${state.currentTab === 'calendar' ? '2px solid' : '2px solid transparent'}; border-color: ${state.currentTab === 'calendar' ? theme.primaryAction : 'transparent'};"
              onclick="switchTab('calendar')">
              ${config.calendar_title}
            </button>
            <button 
              class="tab-button pb-2 font-medium relative"
              style="color: ${state.currentTab === 'organizations' ? theme.primaryAction : theme.secondaryAction}; font-size: ${theme.baseSize * 0.93}px; border-bottom: ${state.currentTab === 'organizations' ? '2px solid' : '2px solid transparent'}; border-color: ${state.currentTab === 'organizations' ? theme.primaryAction : 'transparent'};"
              onclick="switchTab('organizations')">
              ${config.organizations_title}
            </button>
          </div>
          <button 
            class="flex items-center justify-center rounded-full"
            style="width: 40px; height: 40px; border: 2px solid ${theme.primaryAction}; background: ${theme.backgroundColor};"
            onclick="toggleDarkMode()"
            title="Toggle dark mode">
            ${state.darkMode ? `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" stroke="${theme.primaryAction}" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="${theme.primaryAction}" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            ` : `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5287 15.9294C21.3687 15.6594 20.9187 15.2394 19.7987 15.4394C19.1787 15.5494 18.5487 15.5994 17.9187 15.5694C15.5887 15.4694 13.4787 14.3994 12.0087 12.7494C10.7087 11.2994 9.90873 9.40938 9.89873 7.36938C9.89873 6.22938 10.1187 5.12938 10.5687 4.08938C11.0087 3.07938 10.6987 2.54938 10.4787 2.32938C10.2487 2.09938 9.70873 1.77938 8.64873 2.21938C4.55873 3.93938 2.02873 8.03938 2.32873 12.4294C2.62873 16.5594 5.52873 20.0894 9.36873 21.4194C10.2887 21.7394 11.2587 21.9294 12.2587 21.9694C12.4187 21.9794 12.5787 21.9894 12.7387 21.9894C16.0887 21.9894 19.2287 20.4094 21.2087 17.7194C21.8787 16.7894 21.6987 16.1994 21.5287 15.9294Z" stroke="${theme.primaryAction}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `}
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden" style="position: relative;">
        <!-- Grid Background -->
        <div style="position: absolute; inset: 0; background-image: linear-gradient(${theme.secondaryAction}33 1px, transparent 1px), linear-gradient(90deg, ${theme.secondaryAction}33 1px, transparent 1px); background-size: 80px 80px; background-position: -1px -1px; pointer-events: none;"></div>
        
        <!-- Discover Panel -->
        <div id="discover-panel" class="h-full overflow-y-auto px-6 py-6 ${state.currentTab === 'discover' ? '' : 'hidden'}" style="position: relative;">
          <div class="max-w-7xl mx-auto">
            <!-- Filters -->
            <div class="mb-6 space-y-3" style="position: relative;">
              <!-- Fade overlay -->
              <div style="position: absolute; top: -80px; left: -24px; right: -24px; bottom: -60px; background: linear-gradient(to bottom, ${theme.backgroundColor} 0%, ${theme.backgroundColor} 40%, transparent 100%); pointer-events: none; z-index: 0;"></div>
              
              <div style="position: relative; z-index: 1;">
                <p class="font-bold mb-2" style="font-size: ${theme.baseSize * 1.195}px; color: ${theme.secondaryAction}; letter-spacing: 0.05em; text-transform: uppercase;">Category</p>
                <div class="flex flex-wrap gap-2">
                  ${CATEGORIES.map(cat => `
                    <button 
                      class="category-pill px-4 py-2 rounded-lg font-medium"
                      style="background: ${state.selectedCategory === cat.toLowerCase() ? theme.primaryAction : theme.backgroundColor}; 
                             color: ${state.selectedCategory === cat.toLowerCase() ? theme.backgroundColor : theme.textColor};
                             border-color: ${state.selectedCategory === cat.toLowerCase() ? theme.primaryAction : '#e5e7eb'};
                             font-size: ${theme.baseSize * 0.87}px;"
                      onclick="filterByCategory('${cat.toLowerCase()}')">
                      ${cat}
                    </button>
                  `).join('')}
                </div>
              </div>

              <div style="position: relative; z-index: 1; margin-top: 24px;">
                <div style="display: inline-block;">
                  <p class="font-bold mb-1" style="font-size: ${theme.baseSize * 1.195}px; color: ${theme.secondaryAction}; letter-spacing: 0.05em; text-transform: uppercase;">Organization</p>
                  <input 
                    type="text"
                    id="org-search"
                    class="font-medium"
                    style="background: transparent; color: ${theme.textColor}; font-size: ${theme.baseSize * 0.87}px; border: none; border-bottom: 1px solid ${theme.secondaryAction}40; padding: 4px 0; outline: none; width: auto; min-width: 200px; transition: border-color 0.2s ease;"
                    placeholder="search organization..."
                    value="${state.selectedOrganization === 'all' ? '' : state.selectedOrganization}"
                    oninput="filterByOrganization(this.value)"
                    onfocus="this.style.borderColor='${theme.secondaryAction}'"
                    onblur="this.style.borderColor='${theme.secondaryAction}40'">
                </div>
              </div>
            </div>

            <!-- Events Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="events-list" style="position: relative; z-index: 1;">
              ${renderEventsList()}
            </div>
          </div>
        </div>

        <!-- Calendar Panel -->
        <div id="calendar-panel" class="h-full overflow-y-auto px-6 py-6 ${state.currentTab === 'calendar' ? '' : 'hidden'}" style="position: relative;">
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="calendar-list" style="position: relative; z-index: 1;">
              ${renderCalendarList()}
            </div>
          </div>
        </div>

        <!-- Organizations Panel -->
        <div id="organizations-panel" class="h-full overflow-y-auto px-6 py-6 ${state.currentTab === 'organizations' ? '' : 'hidden'}" style="position: relative;">
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="organizations-list" style="position: relative; z-index: 1;">
              ${renderOrganizationsList()}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  renderModals();
}