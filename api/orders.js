const { getOrders, addOrder } = require('./_lib/db');
const { requireAuth, setCors } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    if (req.method === 'GET') {
      const orders = await getOrders(authUser.id);
      return res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }

    if (req.method === 'POST') {
      const { items, total, customer, paymentIntentId } = req.body || {};
      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: 'Количката е празна' });

      const order = {
        id: Date.now(),
        userId: authUser.id,
        items: items.map(i => ({ name: i.name, size: i.volume || i.size || '', qty: i.qty, price: i.price })),
        total: typeof total === 'number' ? total : 0,
        status: 'нова',
        customer: customer || {},
        paymentIntentId: paymentIntentId || null,
        createdAt: new Date().toISOString()
      };
      await addOrder(order);
      return res.json({ success: true, orderId: order.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
