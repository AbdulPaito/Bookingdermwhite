const mongoose = require('mongoose');

const scheduleSettingsSchema = new mongoose.Schema(
  {
    active_days: {
      type: [String],
      required: true,
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      validate: {
        validator: function (days) {
          const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return days.every((day) => validDays.includes(day));
        },
        message: 'Invalid day name. Use: Mon, Tue, Wed, Thu, Fri, Sat, Sun',
      },
    },
    start_time: {
      type: String,
      required: [true, 'Start time is required'],
      default: '09:00',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
    },
    end_time: {
      type: String,
      required: [true, 'End time is required'],
      default: '18:00',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
    },
    interval: {
      type: Number,
      required: [true, 'Interval is required'],
      default: 30,
      min: [10, 'Interval must be at least 10 minutes'],
      max: [120, 'Interval cannot exceed 120 minutes'],
    },
  },
  { timestamps: true }
);

// Only one schedule settings document
scheduleSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('ScheduleSettings', scheduleSettingsSchema);
