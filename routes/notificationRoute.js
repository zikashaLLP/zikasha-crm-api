const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const pushNotificationController = require('../controllers/pushNotificationController');

// Subscribe to push notifications
router.post('/subscribe', verifyToken, pushNotificationController.subscribe);
// Unsubscribe from push notifications
router.post('/unsubscribe', verifyToken, pushNotificationController.unsubscribe);

module.exports = router;