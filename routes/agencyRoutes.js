
const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifySuperadmin, superadminLogin } = require('../middleware/superadminMiddleware');

// Superadmin login endpoint
router.post('/superadmin/login', superadminLogin);

// All agency routes require superadmin authentication
router.use(verifySuperadmin);

router.post('/', agencyController.createAgency);
router.get('/', agencyController.getAgencies);
router.get('/:id', agencyController.getAgencyById);
router.get('/:id/users', agencyController.getAgencyUsers);
router.put('/:id', agencyController.updateAgency);
router.delete('/:id', agencyController.deleteAgency);

module.exports = router;
