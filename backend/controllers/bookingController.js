const { Booking, ScheduleSettings } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Helper: Generate time slots from schedule settings
const generateTimeSlots = (start, end, interval) => {
  const slots = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
    const displayMin = String(currentMin).padStart(2, '0');
    slots.push(`${String(displayHour).padStart(2, '0')}:${displayMin} ${period}`);

    currentMin += interval;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
  const { name, phone, service, date, time, price } = req.body;

  if (!name || !phone || !service || !date || !time) {
    res.status(400);
    throw new Error('Please provide all required fields: name, phone, service, date, time');
  }

  // Unlimited bookings - no slot limit check
  // Multiple clients can book the same time slot

  const booking = await Booking.create({
    name,
    phone,
    service,
    date,
    time,
    price: price || 0,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Booking created successfully',
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
const getBookings = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Admin)
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Confirm booking
// @route   PATCH /api/bookings/:id/confirm
// @access  Private (Admin)
const confirmBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.status === 'confirmed') {
    res.status(400);
    throw new Error('Booking is already confirmed');
  }

  // Unlimited bookings - allow multiple confirmed bookings per slot

  booking.status = 'confirmed';
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
    message: 'Booking confirmed successfully',
  });
});

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Admin)
const cancelBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
    message: 'Booking cancelled successfully',
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await Booking.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Booking deleted successfully',
  });
});

// @desc    Get today's appointments
// @route   GET /api/bookings/today
// @access  Private (Admin)
const getTodaysAppointments = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const appointments = await Booking.find({
    date: today,
    status: { $ne: 'cancelled' },
  }).sort({ time: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get recent bookings
// @route   GET /api/bookings/recent
// @access  Private (Admin)
const getRecentBookings = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get available time slots for a date
// @route   GET /api/bookings/availability
// @access  Public
const getAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error('Please provide a date');
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400);
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  // Get schedule settings
  let schedule = await ScheduleSettings.findOne();

  if (!schedule) {
    // Return default slots if no schedule configured
    schedule = {
      active_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      start_time: '09:00',
      end_time: '18:00',
      interval: 30,
    };
  }

  // Check if date is an active day
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const queryDate = new Date(date + 'T00:00:00');
  const dayName = dayNames[queryDate.getDay()];

  if (!schedule.active_days.includes(dayName)) {
    return res.status(200).json({
      success: true,
      date,
      day: dayName,
      isOpen: false,
      availableSlots: [],
      takenSlots: [],
      message: 'Clinic is closed on this day',
    });
  }

  // Generate all slots
  const allSlots = generateTimeSlots(schedule.start_time, schedule.end_time, schedule.interval);

  // Get taken slots for this date
  const takenBookings = await Booking.find({
    date,
    status: { $ne: 'cancelled' },
  }).select('time');

  const takenSlots = takenBookings.map((b) => b.time);
  const availableSlots = allSlots.filter((slot) => !takenSlots.includes(slot));

  res.status(200).json({
    success: true,
    date,
    day: dayName,
    isOpen: true,
    schedule: {
      start: schedule.start_time,
      end: schedule.end_time,
      interval: schedule.interval,
    },
    allSlots,
    availableSlots,
    takenSlots,
  });
});

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  getTodaysAppointments,
  getRecentBookings,
  getAvailability,
};
