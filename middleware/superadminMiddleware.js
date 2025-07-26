
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifySuperadmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the token is for superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Superadmin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error_code: 'jwt_token_expired', message: 'Token expired, please login again'});
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};
