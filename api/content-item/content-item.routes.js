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
const { protect } = require('../../middleware/auth');

// Apply protection to all routes
router.use(protect);

router
  .route('/')
  .get(getContentItems)
  .post(createContentItem);

router
  .route('/:id')
  .get(getContentItem)
  .put(updateContentItem)
  .delete(deleteContentItem);

module.exports = router; 