const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  getTodaysAppointments,
  getRecentBookings,
  getAvailability,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', createBooking);
router.get('/availability', getAvailability);

// Admin only routes
router.get('/', protect, getBookings);
router.get('/today', protect, getTodaysAppointments);
router.get('/recent', protect, getRecentBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/confirm', protect, confirmBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
