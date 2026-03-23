const { setCors } = require('./_lib/auth');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLIC_KEY';

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.json({
    stripePublicKey: STRIPE_PUBLIC_KEY,
    stripeConfigured: !STRIPE_SECRET_KEY.includes('REPLACE')
  });
};
