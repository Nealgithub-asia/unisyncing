import { config as defaultConfig } from '../config.js';

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

export function handleSignup(event) {
  event.preventDefault();
  
  const config = window.elementSdk?.config || defaultConfig;
  const name = document.getElementById('signup-name').value;
  
  const successModal = document.createElement('div');
  successModal.className = 'fixed inset-0 flex items-center justify-center p-4';
  successModal.style.cssText = 'background: rgba(0, 0, 0, 0.4); z-index: 1001;';
  successModal.innerHTML = `
    <div class="rounded-xl p-6 max-w-sm" style="background: ${config.background_color}; border: 1px solid #e5e7eb;">
      <p class="mb-4" style="color: ${config.text_color}; font-size: ${config.font_size}px;">Welcome, ${name}! Your account has been created successfully.</p>
      <button onclick="this.parentElement.parentElement.remove()" class="w-full px-4 py-2 rounded-lg font-medium" style="background: ${config.primary_action}; color: ${config.background_color};">OK</button>
    </div>
  `;
  document.body.appendChild(successModal);
  
  closeSignupModal();
}
