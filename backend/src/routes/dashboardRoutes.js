const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, allowRoles('admin'), controller.get);

module.exports = router;
