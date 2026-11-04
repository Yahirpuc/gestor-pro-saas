const router = require('express').Router();
const auth = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authMiddleware, auth.me);
router.put('/profile', authMiddleware, auth.updateProfile);

module.exports = router;
