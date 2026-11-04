const router = require('express').Router();
const company = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', company.get);
router.put('/', authMiddleware, company.update);

module.exports = router;
