const jwt = require('jsonwebtoken');
const { getUser, saveUser, addOrder } = require('../_lib/db');
const { JWT_SECRET, setCors } = require('../_lib/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '382209451424-b262nhilchmdaq10oi37r7lq7a12i3qn.apps.googleusercontent.com';

async function seedDemoOrders(userId) {
  const now = Date.now();
  const demos = [
    {
      id: now, userId,
      items: [
        { name: 'OLLEO Натурално слънчогледово олио', size: '750 мл', qty: 1, price: 8.96 },
        { name: 'OLLEO Олио от кориандър', size: '250 мл', qty: 1, price: 7.96 }
      ],
      total: 16.92, status: 'доставена',
      customer: {}, createdAt: new Date(now - 14 * 86400000).toISOString()
    },
    {
      id: now + 1, userId,
      items: [{ name: 'Dorso Масажен балсам', size: '200 мл', qty: 1, price: 24.95 }],
      total: 24.95, status: 'доставена',
      customer: {}, createdAt: new Date(now - 7 * 86400000).toISOString()
    },
    {
      id: now + 2, userId,
      items: [{ name: 'OLLEO Чесново олио', size: '250 мл', qty: 2, price: 7.96 }],
      total: 15.92, status: 'в обработка',
      customer: {}, createdAt: new Date(now - 86400000).toISOString()
    }
  ];
  for (const order of demos) await addOrder(order);
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: 'Липсва Google токен' });

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    const payload = await response.json();

    if (!response.ok || payload.error) {
      return res.status(401).json({ error: 'Невалиден Google токен' });
    }

    if (!GOOGLE_CLIENT_ID.includes('REPLACE') && payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Несъответстващ Google Client ID' });
    }

    const { email, name, sub: googleId } = payload;
    let user = await getUser(email);

    if (!user) {
      user = {
        id: Date.now(),
        name: name || email.split('@')[0],
        email,
        googleId,
        passwordHash: null,
        createdAt: new Date().toISOString()
      };
      await saveUser(user);
      await seedDemoOrders(user.id);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET, { expiresIn: '7d' }
    );
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Грешка при верификация с Google' });
  }
};
