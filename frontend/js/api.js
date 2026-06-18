// EcoTrack Frontend JS — api.js

const API_BASE = 'https://ecotrack-gyvq.onrender.com/api';

// ── Token Management ──
const Auth = {
  getToken: () => localStorage.getItem('eco_token'),
  setToken: (token) => localStorage.setItem('eco_token', token),
  removeToken: () => localStorage.removeItem('eco_token'),

  getUser: () => {
    const u = localStorage.getItem('eco_user');
    return u ? JSON.parse(u) : null;
  },
  setUser: (user) => localStorage.setItem('eco_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('eco_user'),

  isLoggedIn: () => !!localStorage.getItem('eco_token'),

  logout: () => {
    Auth.removeToken();
    Auth.removeUser();
    window.location.href = '/login.html';
  }
};

// ── HTTP Client ──
const api = {
  async request(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get: (url) => api.request(url),
  post: (url, body) => api.request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => api.request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => api.request(url, { method: 'DELETE' }),
};

// ── Toast Notifications ──
function showToast(message, type = 'default') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', default: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || icons.default}</span>${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Guard: redirect to login if not authenticated ──
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ── Guard: redirect to dashboard if already authenticated ──
function redirectIfAuth() {
  if (Auth.isLoggedIn()) {
    window.location.href = '/dashboard.html';
  }
}

// ── Render Navbar ──
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const initial = user ? user.name[0].toUpperCase() : '?';

  return `
    <nav class="navbar">
      <a href="/dashboard.html" class="navbar-brand">
        🌿 Eco<span>Track</span>
      </a>
      <div class="nav-links">
        <a href="/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
        <a href="/calculator.html" class="nav-link ${activePage === 'calculator' ? 'active' : ''}">Calculator</a>
        <a href="/history.html" class="nav-link ${activePage === 'history' ? 'active' : ''}">History</a>
        <a href="/tips.html" class="nav-link ${activePage === 'tips' ? 'active' : ''}">Eco Tips</a>
      </div>
      <div class="nav-user">
        <div class="nav-avatar">${initial}</div>
        <span>${user ? user.name.split(' ')[0] : ''}</span>
        <button onclick="Auth.logout()" class="btn btn-outline btn-sm" style="border-color:rgba(255,255,255,0.3);color:var(--mist)">Logout</button>
      </div>
    </nav>
  `;
}

// ── Format date ──
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── Emission level helper ──
function getEmissionLevel(kg) {
  if (kg < 5) return { label: 'Low', class: 'level-low', badge: 'badge-green' };
  if (kg < 15) return { label: 'Medium', class: 'level-medium', badge: 'badge-yellow' };
  return { label: 'High', class: 'level-high', badge: 'badge-red' };
}
