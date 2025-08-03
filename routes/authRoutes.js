const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAdminOrSuperadmin, verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken, verifyAdminOrSuperadmin, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Superadmin login endpoint
router.post('/superadmin/login', authController.superadminLogin);

module.exports = router;
