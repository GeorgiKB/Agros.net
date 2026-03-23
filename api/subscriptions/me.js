const { getSubscription } = require('../_lib/db');
const { requireAuth, setCors } = require('../_lib/auth');

const PLANS = {
  free: { id: 'free', name: 'Безплатен', priceEur: 0, discount: 0, freeShipping: false },
  club: { id: 'club', name: 'Клубна карта', priceEur: 5.99, discount: 5, freeShipping: false },
  premium: { id: 'premium', name: 'Премиум', priceEur: 9.99, discount: 10, freeShipping: true }
};

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const sub = await getSubscription(authUser.id);
    if (!sub) return res.json({ planId: 'free', ...PLANS.free, active: true });
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      return res.json({ planId: 'free', ...PLANS.free, active: true, expired: true });
    }
    return res.json({ ...sub, ...(PLANS[sub.planId] || PLANS.free), active: true });
  } catch (err) {
    console.error('Subscription me error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
