const { Booking } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get booking statistics
// @route   GET /api/analytics/bookings
// @access  Private (Admin)
const getBookingStats = asyncHandler(async (req, res) => {
  const total = await Booking.countDocuments();
  const pending = await Booking.countDocuments({ status: 'pending' });
  const confirmed = await Booking.countDocuments({ status: 'confirmed' });
  const cancelled = await Booking.countDocuments({ status: 'cancelled' });

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      confirmed,
      cancelled,
    },
  });
});

// @desc    Get weekly booking data (last 7 days)
// @route   GET /api/analytics/weekly
// @access  Private (Admin)
const getWeeklyData = asyncHandler(async (req, res) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate last 7 days
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = dayNames[date.getDay()];

    // Count bookings for this date (all non-cancelled)
    const count = await Booking.countDocuments({
      date: dateStr,
      status: { $ne: 'cancelled' },
    });

    weeklyData.push({
      day: dayName,
      date: dateStr,
      bookings: count,
    });
  }

  res.status(200).json({
    success: true,
    data: weeklyData,
  });
});

// @desc    Get dashboard summary
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Booking stats
  const total = await Booking.countDocuments();
  const pending = await Booking.countDocuments({ status: 'pending' });
  const confirmed = await Booking.countDocuments({ status: 'confirmed' });

  // Today's appointments
  const todayCount = await Booking.countDocuments({
    date: today,
    status: { $ne: 'cancelled' },
  });

  // New bookings this week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const newThisWeek = await Booking.countDocuments({
    createdAt: { $gte: lastWeek },
  });

  // Pending bookings count for today
  const pendingToday = await Booking.countDocuments({
    date: today,
    status: 'pending',
  });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total,
        pending,
        confirmed,
      },
      today: {
        appointments: todayCount,
        pending: pendingToday,
      },
      trends: {
        newThisWeek,
      },
    },
  });
});

module.exports = {
  getBookingStats,
  getWeeklyData,
  getDashboardSummary,
};
