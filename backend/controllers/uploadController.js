const asyncHandler = require('../middleware/asyncHandler');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private (Admin)
const uploadImage = asyncHandler(async (req, res) => {
  console.log('[UPLOAD] req.file:', req.file);
  console.log('[UPLOAD] req.body:', req.body);

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  let result;
  try {
    // Upload file from disk to Cloudinary
    result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'beauty-clinic',
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    });
  } catch (error) {
    console.error('[UPLOAD] Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
    return;
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
      console.log('[UPLOAD] Temp file cleaned up:', req.file.path);
    } catch (cleanupErr) {
      console.error('[UPLOAD] Failed to clean up temp file:', cleanupErr);
    }
  }

  res.json({ url: result.secure_url });
});

// @desc    Delete image from Cloudinary (optional endpoint)
// @route   DELETE /api/upload/:public_id
// @access  Private (Admin)
const deleteImage = asyncHandler(async (req, res) => {
  const { cloudinary } = require('../config/cloudinary');

  const { public_id } = req.params;

  if (!public_id) {
    res.status(400);
    throw new Error('Please provide public_id');
  }

  const result = await cloudinary.uploader.destroy(public_id);

  if (result.result !== 'ok') {
    res.status(400);
    throw new Error('Failed to delete image');
  }

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});

module.exports = {
  uploadImage,
  deleteImage,
};
