const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', logController.createLog);
router.get('/inquiry/:inquiryId', logController.getLogsByInquiry);
router.delete('/:id', logController.deleteLog);

module.exports = router;
