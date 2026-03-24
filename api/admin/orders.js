const { getAllOrders, updateOrder, deleteOrder } = require('../_lib/db');
const { requireAuth, setCors } = require('../_lib/auth');

const ADMIN_EMAIL = 'g.berbenkov@agros.net';

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (authUser.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Забранен достъп' });
  }

  try {
    if (req.method === 'GET') {
      const orders = await getAllOrders();
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(orders);
    }

    if (req.method === 'PATCH') {
      const { order, status, updates } = req.body || {};
      if (!order) return res.status(400).json({ error: 'Липсват данни' });
      const patch = updates || (status ? { status } : null);
      if (!patch) return res.status(400).json({ error: 'Липсват данни' });
      const updated = await updateOrder(order, patch);
      if (!updated) return res.status(404).json({ error: 'Поръчката не е намерена' });
      return res.json({ success: true, order: updated });
    }

    if (req.method === 'DELETE') {
      const { order } = req.body || {};
      if (!order) return res.status(400).json({ error: 'Липсват данни' });
      await deleteOrder(order);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin orders error:', err);
    return res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
  }
};
