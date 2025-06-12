const express = require('express');
const {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem
} = require('./content-item.controller');

const router = express.Router();

// Protect middleware to ensure authentication
const { protect, requireVerifiedEmail } = require('../../middleware/auth');

// Apply protection to all routes
router.use(protect);

router
  .route('/')
  .get(getContentItems)
  .post(requireVerifiedEmail, createContentItem);

router
  .route('/:id')
  .get(getContentItem)
  .put(requireVerifiedEmail, updateContentItem)
  .delete(requireVerifiedEmail, deleteContentItem);

module.exports = router; 