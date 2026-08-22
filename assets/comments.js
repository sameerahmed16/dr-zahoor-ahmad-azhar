const SUPABASE_URL = 'https://esbypurulwzocxxluypm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2yRntu4P7-X1BYLqHiiNzw_M7M4bfxc';
const COMMENTS_ENDPOINT = `${SUPABASE_URL}/rest/v1/comments`;
const POST_COOLDOWN_MS = 15000;

const form = document.getElementById('commentForm');
const nameInput = document.getElementById('commentName');
const messageInput = document.getElementById('commentMessage');
const honeypot = document.getElementById('commentWebsite');
const statusEl = document.getElementById('commentStatus');
const listEl = document.getElementById('commentList');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderComments(comments) {
  if (!comments.length) {
    listEl.innerHTML = '<p class="comment-empty">No messages yet. Be the first to share a memory.</p>';
    return;
  }
  listEl.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-item-head">
        <span class="comment-author">${escapeHtml(c.name && c.name.trim() ? c.name.trim() : 'Anonymous')}</span>
        <span class="comment-date">${formatDate(c.created_at)}</span>
      </div>
      <p class="comment-message">${escapeHtml(c.message)}</p>
    </div>
  `).join('');
}

async function loadComments() {
  try {
    const res = await fetch(`${COMMENTS_ENDPOINT}?select=name,message,created_at&order=created_at.desc&limit=200`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    renderComments(data);
  } catch (err) {
    listEl.innerHTML = '<p class="comment-error">Could not load messages right now. Please try again later.</p>';
  }
}

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.classList.remove('is-error', 'is-success');
  if (type) statusEl.classList.add(type);
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (honeypot.value.trim() !== '') return;

    const message = messageInput.value.trim();
    if (message.length < 2) {
      setStatus('Please write a short message first.', 'is-error');
      return;
    }

    const lastPost = Number(localStorage.getItem('lastCommentPostAt') || 0);
    if (Date.now() - lastPost < POST_COOLDOWN_MS) {
      setStatus('Please wait a moment before posting again.', 'is-error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus('Posting…', null);

    const name = nameInput.value.trim();

    try {
      const res = await fetch(COMMENTS_ENDPOINT, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: name || null, message })
      });
      if (!res.ok) throw new Error('Request failed');
      const [posted] = await res.json();

      localStorage.setItem('lastCommentPostAt', String(Date.now()));
      setStatus('Message posted. Thank you.', 'is-success');
      form.reset();

      const empty = listEl.querySelector('.comment-empty');
      if (empty) empty.remove();
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-item-head">
          <span class="comment-author">${escapeHtml(posted.name && posted.name.trim() ? posted.name.trim() : 'Anonymous')}</span>
          <span class="comment-date">${formatDate(posted.created_at)}</span>
        </div>
        <p class="comment-message">${escapeHtml(posted.message)}</p>
      `;
      listEl.prepend(item);
    } catch (err) {
      setStatus('Could not post your message. Please try again.', 'is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadComments();
}
