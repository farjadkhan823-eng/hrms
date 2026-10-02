const router = require('express').Router();
const controller = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/mark', controller.mark);
router.get('/', controller.list); // service limits employee to own data

module.exports = router;
