
const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyToken, verifyAdmin, verifySuperAdmin, verifyAdminOrSuperadmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifySuperAdmin, agencyController.createAgency);
router.get('/', verifyToken, verifySuperAdmin, agencyController.getAgencies);
router.get('/:id', verifyToken, agencyController.getAgencyById);
router.put('/:id', verifyToken, verifySuperAdmin, agencyController.updateAgency);
router.delete('/:id', verifyToken, verifySuperAdmin, agencyController.deleteAgency);

router.put('/:id/users/:user_id', verifyToken, verifyAdminOrSuperadmin, agencyController.updateAgencyUser);
router.get('/:id/users', verifyToken, verifyAdminOrSuperadmin, agencyController.getAgencyUsers);

module.exports = router;
