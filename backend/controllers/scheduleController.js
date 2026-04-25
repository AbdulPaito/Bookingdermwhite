const { ScheduleSettings, Booking } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Helper: Generate time slots
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

// @desc    Get schedule settings
// @route   GET /api/schedule
// @access  Public
const getSchedule = asyncHandler(async (req, res) => {
  let schedule = await ScheduleSettings.findOne();

  if (!schedule) {
    // Return default if not set
    schedule = {
      active_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      start_time: '09:00',
      end_time: '18:00',
      interval: 30,
    };
  }

  res.status(200).json({
    success: true,
    data: schedule,
  });
});

// @desc    Update schedule settings
// @route   PUT /api/schedule
// @access  Private (Admin)
const updateSchedule = asyncHandler(async (req, res) => {
  const { active_days, start_time, end_time, interval } = req.body;

  // Validate inputs
  if (active_days && !Array.isArray(active_days)) {
    res.status(400);
    throw new Error('active_days must be an array');
  }

  if (start_time && end_time) {
    const start = parseInt(start_time.replace(':', ''));
    const end = parseInt(end_time.replace(':', ''));
    if (start >= end) {
      res.status(400);
      throw new Error('End time must be after start time');
    }
  }

  if (interval && (interval < 10 || interval > 120)) {
    res.status(400);
    throw new Error('Interval must be between 10 and 120 minutes');
  }

  let schedule = await ScheduleSettings.findOne();

  if (!schedule) {
    schedule = await ScheduleSettings.create({
      active_days,
      start_time,
      end_time,
      interval,
    });
  } else {
    schedule = await ScheduleSettings.findByIdAndUpdate(
      schedule._id,
      { active_days, start_time, end_time, interval },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    data: schedule,
  });
});

// @desc    Get available slots for a specific date
// @route   GET /api/schedule/slots
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error('Please provide a date');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400);
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  let schedule = await ScheduleSettings.findOne();

  if (!schedule) {
    schedule = {
      active_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      start_time: '09:00',
      end_time: '18:00',
      interval: 30,
    };
  }

  // Check if day is active
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const queryDate = new Date(date + 'T00:00:00');
  const dayName = dayNames[queryDate.getDay()];

  if (!schedule.active_days.includes(dayName)) {
    return res.status(200).json({
      success: true,
      date,
      day: dayName,
      isOpen: false,
      slots: [],
      message: 'Clinic is closed on this day',
    });
  }

  // Generate all slots
  const allSlots = generateTimeSlots(schedule.start_time, schedule.end_time, schedule.interval);

  // Get booking counts per slot
  const bookingCounts = await Booking.aggregate([
    {
      $match: {
        date,
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: '$time',
        count: { $sum: 1 },
      },
    },
  ]);

  // Create a map of slot -> count
  const countMap = {};
  bookingCounts.forEach((item) => {
    countMap[item._id] = item.count;
  });

  // Build slot objects with just time and count (no limits)
  const slots = allSlots.map((time) => ({
    time,
    count: countMap[time] || 0,
  }));

  res.status(200).json({
    success: true,
    date,
    day: dayName,
    isOpen: true,
    slots,
  });
});

module.exports = {
  getSchedule,
  updateSchedule,
  getAvailableSlots,
};
