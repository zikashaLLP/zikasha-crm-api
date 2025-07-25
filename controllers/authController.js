const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const User = require('../models/User');
const Agency = require('../models/Agency');

// In-memory store for refresh tokens (use DB in production)
let refreshTokens = [];

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, agency_id, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const agency = await Agency.findByPk(agency_id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password_hash, agency_id, role });

    return res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }, include: Agency });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });


    console.log('expired token:', process.env.JWT_EXPIRATION);

    const payload = { userId: user.id, agencyId: user.agency_id, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '15min' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '15d' });

    refreshTokens.push(refreshToken); // Store refresh token in memory (use DB in production)

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, agency: user.Agency.name, agencyId: user.agency_id, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token not found, login again' });
  }
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Handle superadmin tokens
    if (payload.role === 'superadmin') {
      const accessToken = jwt.sign(
        { userId: payload.userId, role: payload.role, email: payload.email },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '15min' }
      );
      return res.json({ accessToken });
    }
    
    // Handle regular user tokens
    const accessToken = jwt.sign(
      { userId: payload.userId, agencyId: payload.agencyId, role: payload.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '15min' }
    );
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};
