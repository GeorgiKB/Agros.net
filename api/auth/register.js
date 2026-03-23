const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUser, saveUser } = require('../_lib/db');
const { JWT_SECRET, setCors } = require('../_lib/auth');

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

    const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id, name, email, createdAt } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
