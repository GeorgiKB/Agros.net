// Upstash Redis helpers
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
// Falls back gracefully if not configured

async function redisRequest(method, args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');

  const path = [method, ...args.map(a => encodeURIComponent(typeof a === 'object' ? JSON.stringify(a) : String(a)))].join('/');
  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function get(key) {
  const val = await redisRequest('get', [key]);
  if (val === null) return null;
  try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return val; }
}

async function set(key, value) {
  await redisRequest('set', [key, JSON.stringify(value)]);
}

async function getUser(email) {
  return await get(`user:email:${email.toLowerCase()}`);
}

async function getUserById(id) {
  return await get(`user:id:${id}`);
}

async function saveUser(user) {
  const u = { ...user, email: user.email.toLowerCase() };
  await Promise.all([
    set(`user:email:${u.email}`, u),
    set(`user:id:${u.id}`, u),
  ]);
  return u;
}

async function getOrders(userId) {
  return (await get(`orders:${userId}`)) || [];
}

async function addOrder(order) {
  const key = order.userId ? `orders:${order.userId}` : `guest-orders:${order.guestEmail}`;
  const existing = (await get(key)) || [];
  existing.push(order);
  await set(key, existing);
  return order;
}

async function getSubscription(userId) {
  return await get(`subscription:${userId}`);
}

async function saveSubscription(userId, sub) {
  await set(`subscription:${userId}`, sub);
  return sub;
}

async function scanKeys(pattern) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return [];

  let cursor = 0;
  let allKeys = [];
  do {
    const res = await fetch(`${url}/scan/${cursor}?match=${encodeURIComponent(pattern)}&count=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) break;
    const [nextCursor, keys] = data.result;
    cursor = nextCursor;
    allKeys = allKeys.concat(keys || []);
  } while (cursor !== '0' && cursor !== 0);

  return allKeys;
}

async function getAllOrders() {
  const [orderKeys, guestKeys] = await Promise.all([
    scanKeys('orders:*'),
    scanKeys('guest-orders:*')
  ]);
  const allKeys = [...orderKeys, ...guestKeys];
  if (allKeys.length === 0) return [];
  const arrays = await Promise.all(allKeys.map(k => get(k)));
  return arrays.flat().filter(Boolean);
}

async function updateOrder(order, updates) {
  const key = order.userId ? `orders:${order.userId}` : `guest-orders:${order.guestEmail}`;
  const list = (await get(key)) || [];
  const idx = list.findIndex(o => String(o.id) === String(order.id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  await set(key, list);
  return list[idx];
}

module.exports = { getUser, getUserById, saveUser, getOrders, addOrder, getAllOrders, updateOrder, getSubscription, saveSubscription };
