const express = require('express');
const XapiStatementController = require('./xapiStatementController');
// const auth = require('../middleware/authMiddleware');
// const tenant = require('../middleware/tenantMiddleware');

const router = express.Router();

// router.use(auth);
// router.use(tenant);

// XapiStatement routes
router.post('/statement/create', XapiStatementController.createXapiStatement);
router.get('/statement/viewAll', XapiStatementController.getAllXapiStatements);
router.get('/statement/view/:id', XapiStatementController.getXapiStatementById);
router.put('/statement/update/:id', XapiStatementController.updateXapiStatement);
router.delete('/statement/delete/:id', XapiStatementController.deleteXapiStatement);

module.exports = router;
