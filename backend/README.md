# Beauty Clinic Booking System - Backend API

Full-featured REST API for a Beauty Clinic Booking System built with Node.js, Express, MongoDB, and Cloudinary.

## Tech Stack

- **Node.js** + **Express.js** - Server framework
- **MongoDB Atlas** + **Mongoose** - Database
- **Cloudinary** - Image uploads
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling

## Project Structure

```
backend/
 ├── config/
 │    ├── db.js            # MongoDB connection
 │    └── cloudinary.js    # Cloudinary config + multer
 ├── controllers/
 │    ├── authController.js
 │    ├── promoController.js
 │    ├── bookingController.js
 │    ├── scheduleController.js
 │    ├── settingsController.js
 │    ├── analyticsController.js
 │    └── uploadController.js
 ├── models/
 │    ├── User.js
 │    ├── Booking.js
 │    ├── Promo.js
 │    ├── ScheduleSettings.js
 │    └── SiteSettings.js
 ├── routes/
 │    ├── authRoutes.js
 │    ├── promoRoutes.js
 │    ├── bookingRoutes.js
 │    ├── scheduleRoutes.js
 │    ├── settingsRoutes.js
 │    ├── analyticsRoutes.js
 │    └── uploadRoutes.js
 ├── middleware/
 │    ├── auth.js          # JWT protection + admin check
 │    ├── errorHandler.js  # Global error handler
 │    └── asyncHandler.js  # Async wrapper
 ├── utils/
 │    └── seed.js          # Seed initial data
 ├── server.js
 └── package.json
```

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/beauty-clinic?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development (with nodemon)
```bash
npm run dev
```

### Production
```bash
npm start
```

## Seeding Data

Run once after first setup to create admin user and default promos:

```bash
npm run seed
```

Default admin credentials:
- **Email:** `admin@glow.ph`
- **Password:** `admin123`

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login admin, returns JWT |
| GET | `/api/auth/me` | Admin | Get current user |

### Promos
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/promos` | Public | Get all promos |
| GET | `/api/promos/:id` | Public | Get single promo |
| POST | `/api/promos` | Admin | Create new promo |
| PUT | `/api/promos/:id` | Admin | Update promo |
| DELETE | `/api/promos/:id` | Admin | Delete promo |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Public | Create booking |
| GET | `/api/bookings` | Admin | Get all bookings |
| GET | `/api/bookings/today` | Admin | Today's appointments |
| GET | `/api/bookings/recent` | Admin | Recent bookings (5) |
| GET | `/api/bookings/availability?date=YYYY-MM-DD` | Public | Available slots |
| PATCH | `/api/bookings/:id/confirm` | Admin | Confirm booking |
| PATCH | `/api/bookings/:id/cancel` | Admin | Cancel booking |

### Schedule
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/schedule` | Public | Get schedule settings |
| PUT | `/api/schedule` | Admin | Update schedule |
| GET | `/api/schedule/slots?date=YYYY-MM-DD` | Public | Available slots for date |

### Site Settings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/settings` | Public | Get site settings |
| PUT | `/api/settings` | Admin | Update site settings |

### Analytics (Dashboard)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics/bookings` | Admin | Booking stats (total/pending/confirmed) |
| GET | `/api/analytics/weekly` | Admin | Last 7 days booking counts |
| GET | `/api/analytics/dashboard` | Admin | Full dashboard summary |

### Upload (Cloudinary)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload` | Admin | Upload image (multipart/form-data) |
| DELETE | `/api/upload/:public_id` | Admin | Delete image from Cloudinary |

## Key Features

- **Double Booking Prevention** - MongoDB compound index prevents same date+time bookings
- **Dynamic Slot Generation** - Available time slots based on schedule settings + existing bookings
- **JWT Authentication** - Admin-only routes protected with Bearer token
- **Cloudinary Integration** - Direct image upload to cloud storage
- **Comprehensive Analytics** - Weekly trends, booking stats, today's appointments
- **Error Handling** - Centralized error handler with proper status codes
- **CORS Ready** - Configured for Vercel frontend deployment

## Deployment (Render)

1. Create a Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Build Command:** `cd backend && npm install`
4. Set **Start Command:** `cd backend && npm start`
5. Add all environment variables in Render Dashboard
6. Update `FRONTEND_URL` to your Vercel URL

## Connect Frontend

Update your frontend API config to point to your Render backend URL.

## License

MIT
