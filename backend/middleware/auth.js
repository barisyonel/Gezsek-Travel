const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkisiz. Token yok.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gezsekk_default_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
}; 