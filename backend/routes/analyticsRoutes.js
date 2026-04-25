const express = require('express');
const router = express.Router();
const {
  getBookingStats,
  getWeeklyData,
  getDashboardSummary,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Admin only routes
router.get('/bookings', protect, getBookingStats);
router.get('/weekly', protect, getWeeklyData);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;
