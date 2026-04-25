const express = require('express');
const router = express.Router();
const {
  getSchedule,
  updateSchedule,
  getAvailableSlots,
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getSchedule);
router.get('/slots', getAvailableSlots);

// Admin only route
router.put('/', protect, updateSchedule);

module.exports = router;
