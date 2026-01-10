import { db } from './firebase.js';
import { collection, addDoc, updateDoc, doc, onSnapshot, query } from "firebase/firestore";
import { state } from './state.js';
import { renderApp } from './ui/appShell.js';

let unsubscribeListener = null;

export function initRealtimeListener() {
  if (unsubscribeListener) return;

  const eventsCollection = collection(db, "events");
  const q = query(eventsCollection);

  unsubscribeListener = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt descending (newest first)
    events.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    state.allEvents = events;
    console.log("Data synced from Firestore");
    renderApp();
  }, (error) => {
    console.error("Firestore Error:", error);
  });
}

export async function addEventToFirestore(eventData) {
  try {
    // Remove the ID field so Firestore generates a unique one
    const { id, ...data } = eventData; 
    
    // Ensure data is clean (no undefined values)
    const cleanData = JSON.parse(JSON.stringify(data));
    
    await addDoc(collection(db, "events"), cleanData);
    return { isOk: true };
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("Error saving data: " + e.message);
    return { isOk: false };
  }
}

export async function updateEventInFirestore(eventId, updatedFields) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, updatedFields);
    return { isOk: true };
  } catch (e) {
    console.error("Error updating document: ", e);
    alert("Error updating data: " + e.message);
    return { isOk: false };
  }
}

// Deprecated: loadData and saveData are replaced by initRealtimeListener and the async functions above.
export function loadData() { initRealtimeListener(); }
export function saveData() {}