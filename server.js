const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TariqMansoor@2026';
const DOMAIN = process.env.DOMAIN || 'test.tariqmansoor.com';
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'site_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '50mb' }));

function renderIndexWithEnv(isAdminRoute) {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  const envPayload = {
    DOMAIN,
    STACK_ENV: 'portainer-production',
    IS_ADMIN_ROUTE: !!isAdminRoute
  };
  const envScript = `<script>
    window.__PORTAINER_ENV__ = ${JSON.stringify(envPayload)};
    window.__PORTAINER_API__ = {
      loadState: async () => {
        try { const r = await fetch("/api/state"); return r.ok ? await r.json() : null; } catch (e) { return null; }
      },
      saveState: async (data) => {
        try {
          await fetch("/api/state", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-password": sessionStorage.getItem("tm_admin_pass") || "" },
            body: JSON.stringify(data)
          });
        } catch (e) {}
      },
      verifyAdmin: async (password) => {
        try {
          const r = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
          });
          return r.ok;
        } catch (e) { return false; }
      },
      sendContactMessage: async (msg) => {
        try {
          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(msg)
          });
          return r.ok;
        } catch (e) { return false; }
      }
    };
  </script>`;
  return html.replace('<head>', '<head>\n  ' + envScript);
}

// 1. Public Website Route (https://tariqmansoor.com/ or https://test.tariqmansoor.com/)
// Normal visitors NEVER see the Control Panel button or Theme Switcher buttons
app.get(['/', '/index.html'], (req, res) => {
  res.send(renderIndexWithEnv(false));
});

// 2. Dedicated Admin Panel Route (https://tariqmansoor.com/admin or https://test.tariqmansoor.com/admin)
// Automatically opens the Admin Password Login Gate & unlocks Control Panel + Theme Switcher upon authentication
app.get(['/admin', '/admin/*'], (req, res) => {
  res.send(renderIndexWithEnv(true));
});

// 3. Server-Side Admin Password Verification Endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Invalid ADMIN_PASSWORD' });
});

// 4. Get Published Website State (Theme, Portfolio Data, Updated CV/Profile PDF, Inbox)
app.get('/api/state', (req, res) => {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      return res.json(JSON.parse(raw));
    } catch (e) {
      return res.json({});
    }
  }
  return res.json({});
});

// 5. Save & Publish Website State from /admin (Protected by ADMIN_PASSWORD)
app.post('/api/state', (req, res) => {
  const pass = req.headers['x-admin-password'];
  if (pass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    return res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save state' });
  }
});

// 6. Public Contact Message Endpoint (Visitors -> Admin Inbox)
app.post('/api/contact', (req, res) => {
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
  }

  try {
    let currentState = {};
    if (fs.existsSync(STATE_FILE)) {
      try {
        currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      } catch (e) {
        currentState = {};
      }
    }
    if (!currentState.inbox || !Array.isArray(currentState.inbox)) {
      currentState.inbox = [];
    }
    const newMsg = {
      id: 'msg-' + Date.now(),
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 100),
      subject: String(subject || 'General Inquiry').trim().slice(0, 200),
      body: String(body).trim().slice(0, 2000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    currentState.inbox.unshift(newMsg);
    if (currentState.inbox.length > 200) {
      currentState.inbox = currentState.inbox.slice(0, 200);
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2), 'utf8');
    return res.json({ ok: true, message: newMsg });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to save message' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Healthcheck endpoint for Docker & Portainer
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', domain: DOMAIN, adminRoute: '/admin', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Prof. Tariq Mansoor Portfolio running on http://${DOMAIN}:${PORT}`);
  console.log(`Admin Control Panel Route: http://${DOMAIN}:${PORT}/admin`);
});
