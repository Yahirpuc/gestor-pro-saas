const router = require('express').Router();
const controller = require('../controllers/eventController');

router.get('/', controller.list);
router.get('/upcoming', controller.upcoming);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
