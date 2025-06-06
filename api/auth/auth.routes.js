const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const validateRequest = require('../../middleware/validateRequest');
const { 
  registerValidation, 
  inviteValidation, 
  acceptInviteValidation 
} = require('./auth.validation');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  inviteMember,
  acceptInvitation
} = require('./auth.controller');
const Role = require('../../models/role.model');

const router = express.Router();

// Add route to get available roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find().select('_id name description');
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching roles'
    });
  }
});

// Apply validation middleware to register route
router.post('/register', validateRequest(registerValidation), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);
router.get('/verifyemail/:token', verifyEmail);

// Protected routes for team member management
router.post(
  '/invite',
  protect,
  authorize('admin'),
  validateRequest(inviteValidation),
  inviteMember
);

router.post(
  '/accept-invitation/:token',
  validateRequest(acceptInviteValidation),
  acceptInvitation
);

module.exports = router;