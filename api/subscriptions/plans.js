const { setCors } = require('../_lib/auth');

const PLANS = {
  free: { id: 'free', name: 'Безплатен', priceEur: 0, discount: 0, freeShipping: false, features: ['Достъп до всички продукти', 'История на поръчките'] },
  club: { id: 'club', name: 'Клубна карта', priceEur: 5.99, discount: 5, freeShipping: false, features: ['5% отстъпка от всички поръчки', 'Приоритетна поддръжка', 'Ранен достъп до нови продукти'] },
  premium: { id: 'premium', name: 'Премиум', priceEur: 9.99, discount: 10, freeShipping: true, features: ['10% отстъпка от всички поръчки', 'Безплатна доставка винаги', 'VIP поддръжка', 'Ексклузивни оферти'] }
};

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.json(Object.values(PLANS));
};
