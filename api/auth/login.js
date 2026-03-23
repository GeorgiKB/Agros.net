const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUser } = require('../_lib/db');
const { JWT_SECRET, setCors } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    const user = await getUser(email);

    if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash))
      return res.status(401).json({ error: 'Грешен имейл или парола' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET, { expiresIn: '7d' }
    );
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
