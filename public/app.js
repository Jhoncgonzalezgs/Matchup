const baseUrl = window.location.origin || 'http://localhost:3000';

function setToken(token) { localStorage.setItem('token', token); }
function getToken() { return localStorage.getItem('token'); }

// Helper
async function api(path, method='GET', body=null, isForm=false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!isForm && body && method !== 'GET') headers['Content-Type'] = 'application/json';

  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

// Register
document.getElementById('btnRegister').addEventListener('click', async () => {
  const email = document.getElementById('regEmail').value;
  const documentv = document.getElementById('regDocument').value;
  const password = document.getElementById('regPassword').value;
  const r = await api('/auth/register', 'POST', { email, document: documentv, password });
  document.getElementById('registerResult').textContent = JSON.stringify(r, null, 2);
});

// Login
document.getElementById('btnLogin').addEventListener('click', async () => {
  const emailOrDocument = document.getElementById('loginEmailOrDocument').value;
  const password = document.getElementById('loginPassword').value;
  const r = await api('/auth/login', 'POST', { emailOrDocument, password });
  if (r && r.token) setToken(r.token);
  document.getElementById('loginResult').textContent = JSON.stringify(r, null, 2);
});

// Confirm
document.getElementById('btnConfirm').addEventListener('click', async () => {
  const token = document.getElementById('confirmToken').value;
  const r = await api('/auth/confirm/' + token, 'GET');
  document.getElementById('confirmResult').textContent = JSON.stringify(r, null, 2);
});

// Recover
document.getElementById('btnRecover').addEventListener('click', async () => {
  const email = document.getElementById('recoverEmail').value;
  const r = await api('/auth/recover', 'POST', { email });
  document.getElementById('recoverResult').textContent = JSON.stringify(r, null, 2);
});

// Reset
document.getElementById('btnReset').addEventListener('click', async () => {
  const token = document.getElementById('resetToken').value;
  const newPassword = document.getElementById('newPassword').value;
  const r = await api('/auth/reset-password', 'POST', { token, newPassword });
  document.getElementById('recoverResult').textContent = JSON.stringify(r, null, 2);
});

// Profile
document.getElementById('btnGetProfile').addEventListener('click', async () => {
  const r = await api('/users/me/profile', 'GET');
  document.getElementById('profileResult').textContent = JSON.stringify(r, null, 2);
});

document.getElementById('btnEditProfile').addEventListener('click', async () => {
  const body = { description: 'Demo description', chatLink: 'https://t.me/demo' };
  const r = await api('/users/me/edit', 'PUT', body);
  document.getElementById('profileResult').textContent = JSON.stringify(r, null, 2);
});

// Search
document.getElementById('btnSearch').addEventListener('click', async () => {
  const q = document.getElementById('searchQ').value;
  const r = await fetch(`${baseUrl}/users/search?q=${encodeURIComponent(q)}`);
  const data = await r.json();
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  data.forEach(u => {
    const el = document.createElement('div');
    el.textContent = `ID ${u.id} - ${u.email || ''} - ${u.description || ''}`;
    container.appendChild(el);
  });
});

// Likes
document.getElementById('btnLike').addEventListener('click', async () => {
  const toUserId = document.getElementById('likeUserId').value;
  const r = await api('/match/like', 'POST', { toUserId });
  document.getElementById('matches').textContent = JSON.stringify(r, null, 2);
});

// Matches
document.getElementById('btnMatches').addEventListener('click', async () => {
  const r = await api('/match', 'GET');
  document.getElementById('matches').textContent = JSON.stringify(r, null, 2);
});

// Messages
document.getElementById('btnSendMessage').addEventListener('click', async () => {
  const toUserId = document.getElementById('msgOtherUserId').value;
  const content = document.getElementById('msgContent').value;
  const r = await api('/messages', 'POST', { toUserId, content });
  document.getElementById('messagesContainer').textContent = JSON.stringify(r, null, 2);
});

document.getElementById('btnGetMessages').addEventListener('click', async () => {
  const id = document.getElementById('msgOtherUserId').value;
  const r = await api(`/messages/${id}`, 'GET');
  document.getElementById('messagesContainer').textContent = JSON.stringify(r, null, 2);
});

// Upload photo
document.getElementById('btnUploadPhoto').addEventListener('click', async () => {
  const fileInput = document.getElementById('photoFile');
  if (!fileInput.files.length) return alert('Selecciona un archivo');
  const form = new FormData();
  form.append('photo', fileInput.files[0]);
  const r = await api('/photos', 'POST', form, true);
  document.getElementById('photoResult').textContent = JSON.stringify(r, null, 2);
});

// Put current token on UI console if set
(function init() {
  const token = getToken();
  if (token) { document.getElementById('loginResult').textContent = 'JWT set in localStorage'; }
})();
