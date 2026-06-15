// ═══════════════════════════════════════════
//  AUTH.JS – Login, Logout, Password Mgmt
// ═══════════════════════════════════════════

let currentUser = null;
let pendingPasswordChangeUser = null;

// ── CREDENTIAL STORE ──────────────────────
// Single source of truth for credentials
// Updated live when manager changes email/password
const CREDENTIAL_STORE = {};

function initCredentialStore() {
  DEMO_USERS.forEach(u => {
    CREDENTIAL_STORE[u.email] = { password: u.password, mustChangePassword: u.mustChangePassword };
  });
}

function updateCredential(oldEmail, newEmail, newPassword) {
  // Remove old entry
  if (oldEmail !== newEmail) {
    delete CREDENTIAL_STORE[oldEmail];
  }
  // Set new entry
  CREDENTIAL_STORE[newEmail] = {
    password: newPassword || CREDENTIAL_STORE[oldEmail]?.password,
    mustChangePassword: false,
  };
  // Also update DEMO_USERS array to stay in sync
  const user = DEMO_USERS.find(u => u.email === oldEmail);
  if (user) {
    user.email    = newEmail;
    user.password = newPassword || user.password;
    user.mustChangePassword = false;
  }
  // Update session
  if (currentUser && currentUser.email === oldEmail) {
    currentUser.email = newEmail;
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(currentUser));
  }
}

// ── LOGIN ─────────────────────────────────
function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.classList.add('hidden');

  if (!email || !password) { showLoginError('Please enter your email and password.'); return; }
  if (!email.endsWith('@' + CONFIG.ALLOWED_DOMAIN)) {
    showLoginError('Only @' + CONFIG.ALLOWED_DOMAIN + ' accounts are allowed.'); return;
  }

  if (CONFIG.DEMO_MODE) {
    // Always check DEMO_USERS directly — it's the live updated source
    const user = DEMO_USERS.find(u =>
      u.email.toLowerCase() === email &&
      u.password === password
    );

    if (!user) {
      showLoginError('Invalid email or password.'); return;
    }

    if (user.mustChangePassword) {
      pendingPasswordChangeUser = user;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('changePasswordScreen').classList.remove('hidden');
      return;
    }
    loginSuccess({ email: user.email, name: user.name, role: user.role });

  } else {
    callAPI('login', { email, password })
      .then(res => {
        if (!res.success) { showLoginError(res.message || 'Login failed.'); return; }
        if (res.mustChangePassword) {
          pendingPasswordChangeUser = res.user;
          document.getElementById('loginScreen').classList.add('hidden');
          document.getElementById('changePasswordScreen').classList.remove('hidden');
          return;
        }
        loginSuccess(res.user);
      })
      .catch(() => showLoginError('Server error. Please try again.'));
  }
}

function handleSetPassword() {
  const p1    = document.getElementById('newPassword1').value;
  const p2    = document.getElementById('newPassword2').value;
  const errEl = document.getElementById('changePwError');
  errEl.classList.add('hidden');

  if (!p1 || p1.length < 8) {
    errEl.textContent = 'Password must be at least 8 characters.';
    errEl.classList.remove('hidden'); return;
  }
  if (p1 !== p2) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.remove('hidden'); return;
  }

  if (CONFIG.DEMO_MODE) {
    const user = DEMO_USERS.find(u => u.email === pendingPasswordChangeUser.email);
    if (user) { user.password = p1; user.mustChangePassword = false; }
    document.getElementById('changePasswordScreen').classList.add('hidden');
    loginSuccess({ email: user.email, name: user.name, role: user.role });
    showToast('Password set! Welcome to 1:1 Trust & Safety.', 'success');
  } else {
    callAPI('setPassword', { email: pendingPasswordChangeUser.email, password: p1 })
      .then(res => {
        if (!res.success) { errEl.textContent = res.message; errEl.classList.remove('hidden'); return; }
        document.getElementById('changePasswordScreen').classList.add('hidden');
        loginSuccess(pendingPasswordChangeUser);
        showToast('Password set successfully!', 'success');
      });
  }
}

function loginSuccess(user) {
  currentUser = user;
  sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(user));
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('changePasswordScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  initApp();
}

function handleLogout() {
  currentUser = null;
  _adminModeOn = false;
  sessionStorage.removeItem(CONFIG.SESSION_KEY);
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  // Reset admin UI
  const banner = document.getElementById('adminModeBanner');
  if (banner) banner.classList.add('hidden');
  const badge = document.getElementById('adminModeTopBadge');
  if (badge) badge.classList.add('hidden');
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function checkSession() {
  const saved = sessionStorage.getItem(CONFIG.SESSION_KEY);
  if (saved) {
    try {
      const user = JSON.parse(saved);
      // Verify user still exists in DEMO_USERS
      const live = DEMO_USERS.find(u => u.email === user.email);
      if (!live) { sessionStorage.removeItem(CONFIG.SESSION_KEY); return false; }
      loginSuccess({ email: live.email, name: live.name, role: live.role });
      return true;
    } catch(e) { sessionStorage.removeItem(CONFIG.SESSION_KEY); }
  }
  return false;
}

function isManager() { return currentUser && currentUser.role === 'Manager'; }

function togglePwVisibility(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; icon.textContent = '🙈'; }
  else { input.type = 'password'; icon.textContent = '👁'; }
}

async function callAPI(action, params = {}) {
  const body = new FormData();
  body.append('action', action);
  Object.entries(params).forEach(([k, v]) => body.append(k, typeof v === 'object' ? JSON.stringify(v) : v));
  const res = await fetch(CONFIG.API_URL, { method: 'POST', body });
  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  ['loginEmail','loginPassword'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
  });
  if (!checkSession()) { /* show login screen */ }
});
