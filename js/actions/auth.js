import { auth, googleProvider } from '../firebase.js';
import { signInWithPopup, createUserWithEmailAndPassword, signOut, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
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

let isLoginMode = false;

export function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const title = document.querySelector('#signup-modal h3');
  const btn = document.getElementById('signup-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  const nameField = document.getElementById('signup-name').parentElement;

  if (isLoginMode) {
    title.textContent = 'Log In';
    btn.textContent = 'Log In';
    nameField.style.display = 'none'; // Hide name for login
    toggleText.innerHTML = 'Need an account? <a href="#" onclick="toggleAuthMode()" class="text-blue-600 hover:underline">Sign Up</a>';
  } else {
    title.textContent = 'Sign Up';
    btn.textContent = 'Sign Up';
    nameField.style.display = 'block'; // Show name for signup
    toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode()" class="text-blue-600 hover:underline">Log In</a>';
  }
}

export async function handleSignup(event) {
  event.preventDefault();
  
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('signup-name').value;
  
  try {
    if (isLoginMode) {
      // LOGIN LOGIC
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
    } else {
      // SIGNUP LOGIC
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // ... (update profile logic remains the same)
      alert(`Welcome, ${name}!`);
    }
    closeSignupModal();
  } catch (error) {
    console.error("Auth Error:", error);
    alert(error.message); // This will tell you if password is wrong, etc.
  }
}
