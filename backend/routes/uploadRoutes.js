const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Multer error handler wrapper
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[UPLOAD] Multer/Cloudinary error:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload image. Check Cloudinary config.',
      });
    }
    next();
  });
};

// Admin only routes
router.post('/', protect, handleUpload, uploadImage);
router.delete('/:public_id', protect, deleteImage);

module.exports = router;
