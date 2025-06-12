const express = require('express');
const XapiStatementController = require('./xapiStatementController');
const { protect, requireVerifiedEmail } = require('../../middleware/auth');
// const tenant = require('../middleware/tenantMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// router.use(auth);
// router.use(tenant);

// XapiStatement routes
router.post('/statement/create', requireVerifiedEmail, XapiStatementController.createXapiStatement);
router.get('/statement/viewAll', XapiStatementController.getAllXapiStatements);
router.get('/statement/view/:id', XapiStatementController.getXapiStatementById);
router.put('/statement/update/:id', requireVerifiedEmail, XapiStatementController.updateXapiStatement);
router.delete('/statement/delete/:id', requireVerifiedEmail, XapiStatementController.deleteXapiStatement);

module.exports = router;
