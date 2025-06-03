 
const express          = require('express');
const exportController = require('../controllers/exportController');
const auth             = require('../middleware/authMiddleware');
const tenant           = require('../middleware/tenantMiddleware');

const router = express.Router();

router.get('/:id/zip', auth, tenant, exportController.exportCourse);

module.exports = router;
