const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, agencyId, role }
    next();
  } catch (err) {
    // Check if the error is due to an expired token
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error_code: 'jwt_token_expired', message: 'Token expired, please login again'});
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.verifyAdmin = (req, res, next) => {
  const user = req.user;

  if(user.role !== 'admin') {
    return res.status(403).json({ message: "You are not permitted to perform this action" });
  }

  next();
}

exports.verifySuperAdmin = (req, res, next) => {
  const user = req.user;

  if(user.role !== 'superadmin') {
    return res.status(403).json({ message: "You are not permitted to perform this action" });
  }

  next();
}

exports.verifyAdminOrSuperadmin = (req, res, next) => {
  const user = req.user;

  if(user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({ message: "You are not permitted to perform this action" });
  }

  next();
}