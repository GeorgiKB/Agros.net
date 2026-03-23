const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'agros-local-secret-2024';

function requireAuth(req, res) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Необходима е автентикация' });
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Невалиден токен' });
    return null;
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { JWT_SECRET, requireAuth, setCors };
