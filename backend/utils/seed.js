require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Promo, ScheduleSettings, SiteSettings } = require('../models');

const ADMIN_EMAIL = 'ginasanchez13@gmail.com';
const ADMIN_PASSWORD = 'Ginasanchez0313';

const seedData = async () => {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await connectDB();
    console.log('[SEED] DB connected successfully.');

    // Seed admin user
    console.log('[SEED] Checking admin user...');
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    if (adminExists) {
      console.log(`[SEED] Admin user exists (${ADMIN_EMAIL}). Resetting password...`);
      adminExists.password = ADMIN_PASSWORD;
      await adminExists.save();
      console.log('[SEED] Admin password updated.');
    } else {
      await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('[SEED] Admin user created successfully.');
    }

    // Seed promos
    console.log('[SEED] Seeding promos...');
    const promoCount = await Promo.countDocuments();
    if (promoCount === 0) {
      await Promo.create([
        {
          title: 'Diamond Peel Glow',
          description: 'Exfoliating microdermabrasion for radiant skin.',
          price: 999,
          image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
          badge: 'BESTSELLER'
        },
        {
          title: 'Hydrafacial Deluxe',
          description: 'Deep cleanse, hydrate, and nourish your skin.',
          price: 1299,
          image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
          badge: 'NEW'
        },
        {
          title: 'Underarm Whitening',
          description: 'Gentle treatment to even skin tone and brighten underarms.',
          price: 899,
          image_url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80',
          badge: '',
        },
        {
          title: 'Glutathione Drip',
          description: 'Antioxidant boost for radiant, even-toned skin from within.',
          price: 1999,
          image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
          badge: 'Premium',
        },
        {
          title: 'Acne Clear Facial',
          description: 'Targeted treatment to clear breakouts and calm inflammation.',
          price: 799,
          image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
          badge: '',
        },
        {
          title: 'Anti-Aging Lift',
          description: 'Tighten, lift and rejuvenate with collagen-stimulating therapy.',
          price: 2499,
          image_url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&q=80',
          badge: 'Luxury',
        },
      ]);
      console.log('[SEED] Default promos created.');
    } else {
      console.log('[SEED] Promos already exist. Skipping.');
    }

    // Seed schedule
    console.log('[SEED] Seeding schedule...');
    const scheduleExists = await ScheduleSettings.findOne();
    if (!scheduleExists) {
      await ScheduleSettings.create({
        active_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        start_time: '09:00',
        end_time: '18:00',
        interval: 30,
      });
      console.log('[SEED] Schedule settings created.');
    } else {
      console.log('[SEED] Schedule settings already exist. Skipping.');
    }

    // Seed site settings
    console.log('[SEED] Seeding site settings...');
    const settingsExists = await SiteSettings.findOne();
    if (!settingsExists) {
      await SiteSettings.create({
        hero_image: '',
        hero_badge: 'Premium Skincare & Wellness',
        hero_title_line1: 'Glow with',
        hero_title_line2: 'Confidence ✨',
        hero_subtext: 'Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.',
        hero_primary_cta: 'Book Now',
        hero_secondary_cta: 'View Promos',
      });
      console.log('[SEED] Site settings created.');
    } else {
      console.log('[SEED] Site settings already exist. Skipping.');
    }

    console.log('[SEED] ✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('[SEED] ❌ Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    console.log('[SEED] Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('[SEED] Disconnected. Exiting.');
    process.exit(process.exitCode || 0);
  }
};

seedData();
