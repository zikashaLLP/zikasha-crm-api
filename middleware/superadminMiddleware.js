
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

exports.superadminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check against environment variables
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superadminEmail || !superadminPassword) {
      return res.status(500).json({ message: 'Superadmin credentials not configured' });
    }

    // Validate credentials
    if (email !== superadminEmail || password !== superadminPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token for superadmin
    const payload = { 
      userId: 'superadmin', 
      role: 'superadmin',
      email: superadminEmail
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRATION || '15m' 
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '15d' 
    });

    res.json({ 
      accessToken, 
      refreshToken, 
      user: { 
        id: 'superadmin', 
        email: superadminEmail, 
        role: 'superadmin' 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};
