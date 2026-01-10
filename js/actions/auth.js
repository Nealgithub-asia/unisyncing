import { auth, googleProvider } from '../firebase.js';
import { signInWithPopup, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { state } from '../state.js';

// --- Modal Controls ---
export function openSignupModal() {
  document.getElementById('signup-modal').classList.remove('hidden');
}

export function closeSignupModal() {
  document.getElementById('signup-modal').classList.add('hidden');
  document.getElementById('signup-form').reset();
}

export function closeSignupModalOnBackdrop(event) {
  if (event.target.id === 'signup-modal') {
    closeSignupModal();
  }
}

// --- Firebase Auth Logic ---

export async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
    closeSignupModal();
  } catch (error) {
    console.error("Google Login Error:", error);
    alert(error.message);
  }
}

export async function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's display name in Firebase
    await updateProfile(result.user, { displayName: name });
    
    closeSignupModal();
    alert(`Welcome, ${name}!`);
  } catch (error) {
    console.error("Signup Error:", error);
    alert(error.message);
  }
}

export async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
}