const router = require('express').Router();
const controller = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', allowRoles('admin'), controller.list);
router.post('/', allowRoles('admin'), controller.create);
router.get('/:id', controller.getOne); // admin or the employee himself
router.put('/:id', allowRoles('admin'), controller.update);
router.delete('/:id', allowRoles('admin'), controller.remove);

module.exports = router;
