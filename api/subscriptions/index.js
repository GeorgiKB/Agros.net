const { getSubscription, saveSubscription } = require('../_lib/db');
const { requireAuth, setCors } = require('../_lib/auth');

const PLANS = {
  free:    { id: 'free',    name: 'Безплатен',    priceEur: 0,    discount: 0,  freeShipping: false, features: ['Достъп до всички продукти', 'История на поръчките'] },
  club:    { id: 'club',    name: 'Клубна карта', priceEur: 5.99, discount: 5,  freeShipping: false, features: ['5% отстъпка от всички поръчки', 'Приоритетна поддръжка', 'Ранен достъп до нови продукти'] },
  premium: { id: 'premium', name: 'Премиум',      priceEur: 9.99, discount: 10, freeShipping: true,  features: ['10% отстъпка от всички поръчки', 'Безплатна доставка винаги', 'VIP поддръжка', 'Ексклузивни оферти'] }
};

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const route = req.query.route;

  // GET /api/subscriptions/plans
  if (route === 'plans') {
    return res.json(Object.values(PLANS));
  }

  // GET /api/subscriptions/me
  if (route === 'me') {
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
  }

  // POST /api/subscriptions (subscribe)
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
