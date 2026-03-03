const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/stats')
    .get(protect, authorize('admin', 'agent'), getDashboardStats);

module.exports = router;
