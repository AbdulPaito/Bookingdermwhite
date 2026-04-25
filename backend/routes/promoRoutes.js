const express = require('express');
const router = express.Router();
const {
  getPromos,
  getPromo,
  createPromo,
  updatePromo,
  deletePromo,
} = require('../controllers/promoController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPromos);
router.get('/:id', getPromo);

// Admin only routes
router.post('/', protect, createPromo);
router.put('/:id', protect, updatePromo);
router.delete('/:id', protect, deletePromo);

module.exports = router;
