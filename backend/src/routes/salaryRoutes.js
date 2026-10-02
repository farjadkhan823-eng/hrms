const router = require('express').Router();
const controller = require('../controllers/salaryController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/generate', allowRoles('admin'), controller.generate);
router.get('/', controller.list); // service limits employee to own data

module.exports = router;
