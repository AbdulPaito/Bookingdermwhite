const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
// Check if .env exists, otherwise use .env.example for local dev
const envPath = path.resolve(__dirname, '.env');
const fs = require('fs');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Connect to database
const connectDB = require('./config/db');
connectDB().catch(err => {
  console.error('[SERVER] MongoDB connection failed. Server will start but DB features will not work.');
  console.error('[SERVER] Fix: Update MONGO_URI in .env or whitelist your IP in Atlas Network Access.');
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const promoRoutes = require('./routes/promoRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000'
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check / root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Beauty Clinic Booking System API is running 🌸',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      promos: '/api/promos',
      bookings: '/api/bookings',
      schedule: '/api/schedule',
      settings: '/api/settings',
      analytics: '/api/analytics',
      upload: '/api/upload',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
