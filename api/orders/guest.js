const { addOrder } = require('../_lib/db');
const { setCors } = require('../_lib/auth');
const { sendOrderNotification } = require('../_lib/email');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items, total, customer, paymentIntentId, paymentMethod } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Количката е празна' });
    if (!customer || !customer.email)
      return res.status(400).json({ error: 'Имейлът е задължителен за гост поръчка' });

    const order = {
      id: Date.now(),
      userId: null,
      guestEmail: customer.email,
      items: items.map(i => ({ name: i.name, size: i.volume || i.size || '', qty: i.qty, price: i.price })),
      total: typeof total === 'number' ? total : 0,
      status: 'нова',
      customer: customer || {},
      paymentIntentId: paymentIntentId || null,
      paymentMethod: paymentMethod || 'card',
      createdAt: new Date().toISOString()
    };
    await addOrder(order);
    sendOrderNotification(order).catch(() => {});
    return res.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Guest order error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
