const express = require('express');
const exportController = require('../xapi/exportController');
const { protect, requireVerifiedEmail } = require('../../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Export routes - all require email verification
router.get('/:id/zip', requireVerifiedEmail, exportController.exportCourse);
router.post('/:id/zip', requireVerifiedEmail, exportController.exportCourse);

module.exports = router;
