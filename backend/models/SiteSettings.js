const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    hero_image: {
      type: String,
      default: '',
    },
    hero_badge: {
      type: String,
      default: 'Premium Skincare & Wellness',
    },
    hero_title_line1: {
      type: String,
      default: 'Glow with',
    },
    hero_title_line2: {
      type: String,
      default: 'Confidence ✨',
    },
    hero_subtext: {
      type: String,
      default:
        'Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.',
    },
    hero_primary_cta: {
      type: String,
      default: 'Book Now',
    },
    hero_secondary_cta: {
      type: String,
      default: 'View Promos',
    },
  },
  { timestamps: true }
);

// Only one site settings document
siteSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
