const { getSubscription, saveSubscription } = require('../_lib/db');
const { requireAuth, setCors } = require('../_lib/auth');

const PLANS = {
  free: { id: 'free', priceEur: 0 },
  club: { id: 'club', priceEur: 5.99 },
  premium: { id: 'premium', priceEur: 9.99 }
};

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { planId, paymentIntentId } = req.body || {};
    if (!PLANS[planId]) return res.status(400).json({ error: 'Невалиден план' });

    const expiresAt = planId === 'free' ? null : new Date(Date.now() + 30 * 86400000).toISOString();
    const sub = {
      userId: authUser.id,
      planId,
      paymentIntentId: paymentIntentId || null,
      activatedAt: new Date().toISOString(),
      expiresAt
    };
    await saveSubscription(authUser.id, sub);
    return res.json({ success: true, subscription: { ...sub, ...PLANS[planId] } });
  } catch (err) {
    console.error('Subscription update error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
