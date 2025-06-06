const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats
} = require('./organization.controller');

const router = express.Router();
router.post(
  '/',
  createOrganization
);
// Protect all routes after this middleware
router.use(protect);

// Stats route
router.get('/stats', authorize('admin'), getOrganizationStats);

// Standard CRUD routes
router
  .route('/')
  .get(getOrganizations)
 

router
  .route('/:id')
  .get(getOrganization)
  .put(authorize('admin'), updateOrganization)
  .delete(authorize('admin'), deleteOrganization);

module.exports = router; 