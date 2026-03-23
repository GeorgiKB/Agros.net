/* auth.js — Agros client-side auth state
   Injects a user/login icon into every page's navbar automatically.
   Exposes window.AgrosAuth for use by login/register/account pages.
*/
(function () {
  const API = 'http://localhost:3001';

  window.AgrosAuth = {
    api: API,
    getToken() { return localStorage.getItem('agros_token'); },
    getUser()  {
      try { return JSON.parse(localStorage.getItem('agros_user')); }
      catch { return null; }
    },
    save(token, user) {
      localStorage.setItem('agros_token', token);
      localStorage.setItem('agros_user', JSON.stringify(user));
    },
    logout() {
      localStorage.removeItem('agros_token');
      localStorage.removeItem('agros_user');
      window.location.href = '/index.html';
    }
  };

  function injectNavButton() {
    // Avoid double-injecting
    if (document.getElementById('nav-auth-btn')) return;

    // Anchor to the cart button which exists on every page
    const cartBtn = document.querySelector('[aria-label="Количка"]');
    if (!cartBtn) return;

    const user = window.AgrosAuth.getUser();
    const btn  = document.createElement('a');
    btn.id = 'nav-auth-btn';
    btn.style.cssText =
      'display:flex;align-items:center;padding:0.625rem;border-radius:9999px;' +
      'transition:background-color 0.2s ease;cursor:pointer;';

    if (user) {
      btn.href  = '/account.html';
      btn.title = user.name;
      btn.setAttribute('aria-label', 'Акаунт');
      // Green person icon when logged in
      btn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="#416241" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="8" r="4"/>' +
        '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    } else {
      btn.href = '/login.html';
      btn.setAttribute('aria-label', 'Вход');
      // Grey person icon when logged out
      btn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="8" r="4"/>' +
        '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    }

    btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = 'rgba(65,98,65,0.08)'; });
    btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = ''; });

    // Insert before the cart button
    cartBtn.parentNode.insertBefore(btn, cartBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavButton);
  } else {
    injectNavButton();
  }
})();
