const express          = require('express');
const exportController = require('../controllers/exportController');
// const auth             = require('../middleware/authMiddleware');
// const tenant           = require('../middleware/tenantMiddleware');

const router = express.Router();

// router.use(auth);
// router.use(tenant);

router.get('/:id/zip', exportController.exportCourse);
router.post('/:id/zip', exportController.exportCourse);

module.exports = router;
