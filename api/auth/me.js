const { getUserById } = require('../_lib/db');
const { requireAuth, setCors } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const user = await getUserById(authUser.id);
    if (!user) return res.status(404).json({ error: 'Потребителят не е намерен' });
    return res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
