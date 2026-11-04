const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');

router.use('/auth', require('./authRoutes'));
router.use('/company', require('./companyRoutes'));

// Protected data routes
router.use('/clients', authMiddleware, require('./clientRoutes'));
router.use('/projects', authMiddleware, require('./projectRoutes'));
router.use('/proposals', authMiddleware, require('./proposalRoutes'));
router.use('/contracts', authMiddleware, require('./contractRoutes'));
router.use('/events', authMiddleware, require('./eventRoutes'));
router.use('/dashboard', authMiddleware, require('./dashboardRoutes'));

module.exports = router;
