const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUser, saveUser, getOrders, addOrder } = require('../_lib/db');
const { JWT_SECRET, setCors } = require('../_lib/auth');

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
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Всички полета са задължителни' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Паролата трябва да е поне 6 символа' });

    const existing = await getUser(email);
    if (existing) return res.status(400).json({ error: 'Имейлът вече е регистриран' });

    const id = Date.now();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    await saveUser({ id, name, email, passwordHash, createdAt });
    await seedDemoOrders(id);

    const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id, name, email, createdAt } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
