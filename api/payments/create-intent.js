const { requireAuth, setCors } = require('../_lib/auth');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY';

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (STRIPE_SECRET_KEY.includes('REPLACE')) {
    return res.status(503).json({
      error: 'Stripe не е конфигуриран.',
      hint: 'Задайте STRIPE_SECRET_KEY и STRIPE_PUBLIC_KEY като environment variables.'
    });
  }

  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    const { amountEur, description, metadata } = req.body || {};
    if (!amountEur || amountEur <= 0)
      return res.status(400).json({ error: 'Невалидна сума' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountEur * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      description: description || 'Agros поръчка',
      metadata: { userId: String(authUser.id), ...metadata }
    });
    return res.json({ clientSecret: intent.client_secret, intentId: intent.id });
  } catch (err) {
    console.error('Payment intent error:', err);
    return res.status(500).json({ error: err.message });
  }
};
