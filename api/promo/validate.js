const { setCors } = require('../_lib/auth');

const HARDCODED_CODES = {
  "BATJORO": { type: "percent", value: 80, label: "80% отстъпка" }
};

// Additional codes can be added via PROMO_CODES env var as JSON string
function getPromoCodes() {
  let extra = {};
  if (process.env.PROMO_CODES) {
    try { extra = JSON.parse(process.env.PROMO_CODES); } catch {}
  }
  return { ...HARDCODED_CODES, ...extra };
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, subtotal } = req.body || {};
  if (!code || !String(code).trim()) {
    return res.status(400).json({ error: 'Моля, въведете промо код.' });
  }

  const codes = getPromoCodes();
  const normalizedCode = String(code).trim().toUpperCase();
  const promo = codes[normalizedCode];

  if (!promo) {
    return res.status(404).json({ error: 'Невалиден промо код.' });
  }

  const sub = Number(subtotal) || 0;
  let discount = 0;

  if (promo.type === 'percent') {
    discount = sub * promo.value / 100;
  } else if (promo.type === 'fixed') {
    discount = promo.value;
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, sub);
  discount = Math.round(discount * 100) / 100;

  return res.json({
    valid: true,
    code: normalizedCode,
    type: promo.type,
    value: promo.value,
    label: promo.label,
    discount
  });
};
