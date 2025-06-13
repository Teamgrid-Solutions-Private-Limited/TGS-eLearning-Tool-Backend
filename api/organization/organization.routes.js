const express = require('express');
const { protect, authorize, requireVerifiedEmail } = require('../../middleware/auth');
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
router.get('/stats', authorize('admin'), requireVerifiedEmail, getOrganizationStats);

// Standard CRUD routes
router
  .route('/')
  .get(getOrganizations)
 

router
  .route('/:id')
  .get(getOrganization)
  .put(authorize('admin'), requireVerifiedEmail, updateOrganization)
  .delete(authorize('admin'), requireVerifiedEmail, deleteOrganization);

module.exports = router; 