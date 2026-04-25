const { SiteSettings } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Default settings
const defaultSettings = {
  hero_image: '',
  hero_badge: 'Premium Skincare & Wellness',
  hero_title_line1: 'Glow with',
  hero_title_line2: 'Confidence ✨',
  hero_subtext:
    'Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.',
  hero_primary_cta: 'Book Now',
  hero_secondary_cta: 'View Promos',
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    // Create default settings if none exist
    settings = await SiteSettings.create(defaultSettings);
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  const {
    hero_image,
    hero_badge,
    hero_title_line1,
    hero_title_line2,
    hero_subtext,
    hero_primary_cta,
    hero_secondary_cta,
  } = req.body;

  let settings = await SiteSettings.findOne();

  const updateData = {
    ...(hero_image !== undefined && { hero_image }),
    ...(hero_badge !== undefined && { hero_badge }),
    ...(hero_title_line1 !== undefined && { hero_title_line1 }),
    ...(hero_title_line2 !== undefined && { hero_title_line2 }),
    ...(hero_subtext !== undefined && { hero_subtext }),
    ...(hero_primary_cta !== undefined && { hero_primary_cta }),
    ...(hero_secondary_cta !== undefined && { hero_secondary_cta }),
  };

  if (!settings) {
    settings = await SiteSettings.create({
      ...defaultSettings,
      ...updateData,
    });
  } else {
    settings = await SiteSettings.findByIdAndUpdate(settings._id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Reset settings to defaults
// @route   DELETE /api/settings
// @access  Private (Admin)
const resetSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (settings) {
    await SiteSettings.findByIdAndUpdate(settings._id, defaultSettings, {
      new: true,
    });
  } else {
    settings = await SiteSettings.create(defaultSettings);
  }

  res.status(200).json({
    success: true,
    data: settings,
    message: 'Settings reset to defaults',
  });
});

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
