require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3001;
const JWT_SECRET = 'agros-local-secret-2024';
const DATA_DIR   = path.join(__dirname, 'data');

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Get your Client ID at https://console.cloud.google.com → APIs & Services → Credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '382209451424-b262nhilchmdaq10oi37r7lq7a12i3qn.apps.googleusercontent.com';

// ── Stripe ────────────────────────────────────────────────────────────────────
// Get your keys at https://dashboard.stripe.com/apikeys
// Set STRIPE_SECRET_KEY env variable, or replace the string below with sk_test_...
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY';
// Expose to frontend via /api/config (publishable key only)
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLIC_KEY';

let stripe = null;
try {
  if (!STRIPE_SECRET_KEY.includes('REPLACE')) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.warn('Stripe init failed:', e.message);
}

// ── Subscription plans ────────────────────────────────────────────────────────
const PLANS = {
  free: {
    id: 'free', name: 'Безплатен', priceEur: 0,
    discount: 0, freeShipping: false,
    features: ['Достъп до всички продукти', 'История на поръчките']
  },
  club: {
    id: 'club', name: 'Клубна карта', priceEur: 5.99,
    discount: 5, freeShipping: false,
    features: ['5% отстъпка от всички поръчки', 'Приоритетна поддръжка', 'Ранен достъп до нови продукти']
  },
  premium: {
    id: 'premium', name: 'Премиум', priceEur: 9.99,
    discount: 10, freeShipping: true,
    features: ['10% отстъпка от всички поръчки', 'Безплатна доставка винаги', 'VIP поддръжка', 'Ексклузивни оферти']
  }
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// ── File-based database helpers ───────────────────────────────────────────────
function readDB(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeDB(name, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Необходима е автентикация' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Невалиден токен' });
  }
}

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Всички полета са задължителни' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Паролата трябва да е поне 6 символа' });

  const users = readDB('users');
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Имейлът вече е регистриран' });

  const id           = Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt    = new Date().toISOString();
  users.push({ id, name, email, passwordHash, createdAt });
  writeDB('users', users);

  const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, name, email, createdAt } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const users = readDB('users');
  const user  = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'Грешен имейл или парола' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = readDB('users').find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Потребителят не е намерен' });
  res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'Липсва Google токен' });

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    const payload = await response.json();

    if (!response.ok || payload.error) {
      return res.status(401).json({ error: 'Невалиден Google токен' });
    }

    // Verify audience when client ID is configured
    if (!GOOGLE_CLIENT_ID.includes('REPLACE') && payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Несъответстващ Google Client ID' });
    }

    const { email, name, sub: googleId } = payload;
    const users = readDB('users');
    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: Date.now(),
        name: name || email.split('@')[0],
        email,
        googleId,
        passwordHash: null,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      writeDB('users', users);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });

  } catch (err) {
    res.status(500).json({ error: 'Грешка при верификация с Google' });
  }
});

// ── ORDER ROUTES ──────────────────────────────────────────────────────────────

// Guest order (no account required)
app.post('/api/orders/guest', (req, res) => {
  const { items, total, customer, paymentIntentId } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Количката е празна' });
  if (!customer || !customer.email)
    return res.status(400).json({ error: 'Имейлът е задължителен за гост поръчка' });

  const orders = readDB('orders');
  const order = {
    id: Date.now(),
    userId: null,
    guestEmail: customer.email,
    items: items.map(i => ({ name: i.name, size: i.volume || i.size || '', qty: i.qty, price: i.price })),
    total: typeof total === 'number' ? total : 0,
    status: 'нова',
    customer: customer || {},
    paymentIntentId: paymentIntentId || null,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeDB('orders', orders);
  res.json({ success: true, orderId: order.id });
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = readDB('orders')
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.post('/api/orders', requireAuth, (req, res) => {
  const { items, total, customer, paymentIntentId } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Количката е празна' });

  const orders = readDB('orders');
  const order = {
    id: Date.now(),
    userId: req.user.id,
    items: items.map(i => ({ name: i.name, size: i.volume || i.size || '', qty: i.qty, price: i.price })),
    total: typeof total === 'number' ? total : 0,
    status: 'нова',
    customer: customer || {},
    paymentIntentId: paymentIntentId || null,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeDB('orders', orders);
  res.json({ success: true, orderId: order.id });
});

// ── SUBSCRIPTION ROUTES ───────────────────────────────────────────────────────

app.get('/api/subscriptions/plans', (req, res) => {
  res.json(Object.values(PLANS));
});

app.get('/api/subscriptions/me', requireAuth, (req, res) => {
  const subs = readDB('subscriptions');
  const sub  = subs.find(s => s.userId === req.user.id);
  if (!sub) return res.json({ planId: 'free', ...PLANS.free, active: true });

  // Check expiry
  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
    return res.json({ planId: 'free', ...PLANS.free, active: true, expired: true });
  }

  res.json({ ...sub, ...PLANS[sub.planId] || PLANS.free, active: true });
});

app.post('/api/subscriptions', requireAuth, (req, res) => {
  const { planId, paymentIntentId } = req.body || {};
  if (!PLANS[planId]) return res.status(400).json({ error: 'Невалиден план' });

  const subs     = readDB('subscriptions');
  const idx      = subs.findIndex(s => s.userId === req.user.id);
  const expiresAt = planId === 'free'
    ? null
    : new Date(Date.now() + 30 * 86400000).toISOString(); // 30 days

  const sub = {
    userId:          req.user.id,
    planId,
    paymentIntentId: paymentIntentId || null,
    activatedAt:     new Date().toISOString(),
    expiresAt
  };

  if (idx >= 0) subs[idx] = sub;
  else          subs.push(sub);
  writeDB('subscriptions', subs);

  res.json({ success: true, subscription: { ...sub, ...PLANS[planId] } });
});

// ── PAYMENT ROUTES ────────────────────────────────────────────────────────────

// Expose config to frontend (publishable key only — safe to expose)
app.get('/api/config', (req, res) => {
  res.json({
    stripePublicKey: STRIPE_PUBLIC_KEY,
    stripeConfigured: !!stripe
  });
});

// Create payment intent
app.post('/api/payments/create-intent', requireAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe не е конфигуриран.',
      hint: 'Задайте STRIPE_SECRET_KEY и STRIPE_PUBLIC_KEY в server.js или като environment variables.'
    });
  }

  const { amountEur, description, metadata } = req.body || {};
  if (!amountEur || amountEur <= 0)
    return res.status(400).json({ error: 'Невалидна сума' });

  try {
    const intent = await stripe.paymentIntents.create({
      amount:               Math.round(amountEur * 100),
      currency:             'eur',
      payment_method_types: ['card'],
      description:          description || 'Agros поръчка',
      metadata:             { userId: String(req.user.id), ...metadata }
    });
    res.json({ clientSecret: intent.client_secret, intentId: intent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CONTACT ROUTES ────────────────────────────────────────────────────────────

app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Името, имейлът и съобщението са задължителни.' });
  }

  const messages = readDB('messages');
  const newMessage = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    subject: subject || '',
    message,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  writeDB('messages', messages);

  res.json({ success: true, messageId: newMessage.id });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Agros API → http://localhost:${PORT}\n`);
  if (!stripe) {
    console.log('  ⚠️  Stripe не е конфигуриран — плащанията работят в демо режим.');
    console.log('  → Заменете STRIPE_SECRET_KEY и STRIPE_PUBLIC_KEY в server.js\n');
  } else {
    console.log('  ✓  Stripe конфигуриран\n');
  }
});
