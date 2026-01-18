import { state } from '../state.js';

export async function addToGoogleCalendar(eventId) {
  const event = state.allEvents.find(e => e.id === eventId);
  if (!event) return;

  // Retrieve token from state or local storage
  const token = state.googleAccessToken || localStorage.getItem('googleAccessToken');

  if (!token) {
    alert("Please log out and sign in with Google again to enable Calendar integration.");
    return;
  }

  const btn = document.querySelector(`button[data-event-id="${eventId}"]`);
  // Store original content to revert on error, but we will change it on success
  const originalContent = btn ? btn.innerHTML : '';
  
  if (btn) {
      btn.innerText = 'Saving...';
      btn.disabled = true;
  }

  try {
    // Construct Start and End times
    // Assuming event.date is YYYY-MM-DD and event.time is HH:MM
    // We default duration to 1 hour if no end time is specified
    const startTimeStr = `${event.date}T${event.time}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

    // Handle Invalid Date
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid event date/time format");
    }

    const eventResource = {
      summary: event.title,
      location: event.location,
      description: event.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventResource)
    });

    if (response.ok) {
      alert(`Successfully added "${event.title}" to your Google Calendar!`);
      
      // Update Button to "Save to Calendar (Again)" state
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Save to Calendar (Again)
        `;
      }

    } else {
      const errorData = await response.json();
      console.error('Google Calendar API Error:', errorData);
      
      if (btn) {
          btn.innerHTML = originalContent;
          btn.disabled = false;
      }

      if (response.status === 401) {
         alert("Session expired. Please log out and log in again with Google.");
      } else {
         alert("Failed to add event to calendar. Check console for details.");
      }
    }
  } catch (error) {
    console.error('Calendar Error:', error);
    alert("An error occurred while connecting to Google Calendar.");
    if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
  }
}