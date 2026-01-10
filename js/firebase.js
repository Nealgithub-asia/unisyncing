import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { state } from './state.js';

// --- CONFIGURATION ---
// TODO: Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db;

export async function initFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized");

    // Load initial data
    await loadFromFirestore();
    
    // Attach SDK methods for the app to use
    window.dataSdk = {
      create: createEventOrClub,
      update: updateEventOrClub
    };
    
  } catch (error) {
    console.error("Firebase init failed:", error);
  }
}

async function loadFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    const events = [];
    querySnapshot.forEach((doc) => {
      // We explicitly merge doc.id, though your app stores ID inside the object too
      events.push({ ...doc.data(), id: doc.id });
    });
    
    // Only update state if we actually found data
    if (events.length > 0) {
      state.allEvents = events;
      console.log(`Loaded ${events.length} items from Firestore`);
    } else {
      console.log("No events found in Firestore, using defaults/local storage fallback.");
    }
  } catch (error) {
    console.error("Error loading documents: ", error);
  }
}

// --- SDK IMPLEMENTATION ---

async function createEventOrClub(item) {
  try {
    // We use setDoc with the specific ID your app generated (Date.now())
    // to ensure the ID in the document body matches the ID in Firestore path.
    await setDoc(doc(db, "events", item.id), item);
    
    // IMPORTANT: Update local state immediately so UI reflects change
    // The original code skips local push if dataSdk is present, expecting us to handle it.
    state.allEvents.push(item);
    
    return { isOk: true };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { isOk: false, error: e };
  }
}

async function updateEventOrClub(item) {
  try {
    // Merge: true ensures we don't overwrite fields if we missed any,
    // though usually you pass the whole object here.
    await setDoc(doc(db, "events", item.id), item, { merge: true });
    
    // Update local state
    const index = state.allEvents.findIndex(e => e.id === item.id);
    if (index !== -1) {
      state.allEvents[index] = item;
    }

    return { isOk: true };
  } catch (e) {
    console.error("Error updating document: ", e);
    return { isOk: false, error: e };
  }
}