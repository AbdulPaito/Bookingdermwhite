const { Promo } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all promos
// @route   GET /api/promos
// @access  Public
const getPromos = asyncHandler(async (req, res) => {
  const promos = await Promo.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: promos.length,
    data: promos,
  });
});

// @desc    Get single promo
// @route   GET /api/promos/:id
// @access  Public
const getPromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findById(req.params.id);

  if (!promo) {
    res.status(404);
    throw new Error('Promo not found');
  }

  res.status(200).json({
    success: true,
    data: promo,
  });
});

// @desc    Create new promo
// @route   POST /api/promos
// @access  Private (Admin)
const createPromo = asyncHandler(async (req, res) => {
  const { title, description, price, image_url, badge } = req.body;

  if (!title || !description || !price || !image_url) {
    res.status(400);
    throw new Error('Please provide title, description, price, and image_url');
  }

  const promo = await Promo.create({
    title,
    description,
    price,
    image_url,
    badge: badge || '',
  });

  res.status(201).json({
    success: true,
    data: promo,
  });
});

// @desc    Update promo
// @route   PUT /api/promos/:id
// @access  Private (Admin)
const updatePromo = asyncHandler(async (req, res) => {
  let promo = await Promo.findById(req.params.id);

  if (!promo) {
    res.status(404);
    throw new Error('Promo not found');
  }

  promo = await Promo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: promo,
  });
});

// @desc    Delete promo
// @route   DELETE /api/promos/:id
// @access  Private (Admin)
const deletePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findById(req.params.id);

  if (!promo) {
    res.status(404);
    throw new Error('Promo not found');
  }

  await Promo.deleteOne({ _id: promo._id });

  res.status(200).json({
    success: true,
    message: 'Promo deleted successfully',
  });
});

module.exports = {
  getPromos,
  getPromo,
  createPromo,
  updatePromo,
  deletePromo,
};
