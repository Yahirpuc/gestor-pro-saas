const router = require('express').Router();
const controller = require('../controllers/dashboardController');

router.get('/summary', controller.summary);
router.get('/activity', controller.activity);

module.exports = router;
