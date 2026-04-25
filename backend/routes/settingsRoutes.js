const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/', getSettings);

// Admin only routes
router.put('/', protect, updateSettings);
router.delete('/', protect, resetSettings);

module.exports = router;
