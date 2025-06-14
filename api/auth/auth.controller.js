const crypto = require('crypto');
const { AppError } = require('../../middleware/errorHandler');
const User = require('../../models/user.model');
const Organization = require('../../models/organization.model');
const sendEmail = require('../../services/email.service');
const asyncHandler = require('../../middleware/asyncHandler');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, organization, position, department, termsAccepted, privacyPolicyAccepted } = req.body;

  try {
    // Check if organization exists and is active
    const org = await Organization.findById(organization);
    if (!org) {
      return next(new AppError('Organization not found', 404));
    }
    if (!org.isActive) {
      return next(new AppError('Organization is not active', 400));
    }

    // Check if email is unique within the organization
    const existingUser = await User.findOne({ email, organization });
    if (existingUser) {
      return next(new AppError('Email already exists in this organization', 400));
    }

    // Create user with terms and privacy policy acceptance timestamps
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      organization,
      position,
      department,
      termsAccepted,
      privacyPolicyAccepted,
      termsAcceptedAt: termsAccepted ? Date.now() : null,
      privacyPolicyAcceptedAt: privacyPolicyAccepted ? Date.now() : null
    });

    // Populate role and organization information
    await user.populate(['role', 'organization']);

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Create verification url
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;

    const message = `Please click on the link to verify your email: \n\n ${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message
      });

      // Send response without waiting for email
      sendTokenResponse(user, 201, res);
    } catch (err) {
      // If email fails, log it but don't fail the registration
      console.error('Email sending failed:', err);
      
      // Clear the verification tokens
      user.verifyEmailToken = undefined;
      user.verifyEmailExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // Create user response object without sensitive data
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        position: user.position,
        department: user.department,
        isEmailVerified: user.isEmailVerified,
        termsAccepted: user.termsAccepted,
        privacyPolicyAccepted: user.privacyPolicyAccepted,
        termsAcceptedAt: user.termsAcceptedAt,
        privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
        createdAt: user.createdAt
      };

      // Still send success response but with a warning
      res.status(201).json({
        success: true,
        message: 'Registration successful but verification email could not be sent. Please contact support.',
        token: user.getSignedJwtToken(),
        data: userResponse
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email })
    .select('+password')
    .populate(['role', 'organization']);

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if organization is active
  if (!user.organization.isActive) {
    return next(new AppError('Your organization is not active. Please contact support.', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account is not active. Please contact support.', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification url
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;

    try {
      // Send verification email
      await sendEmail({
        email: user.email,
        subject: 'Email Verification Required',
        message: `Your email is not verified. Please click on the link to verify your email: \n\n ${verificationUrl}`
      });

      return next(new AppError('Your email is not verified. A new verification link has been sent to your email.', 403));
    } catch (err) {
      // If email fails, log it but still tell user they need to verify
      console.error('Email sending failed:', err);
      
      // Clear the verification tokens
      user.verifyEmailToken = undefined;
      user.verifyEmailExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Your email is not verified. Please contact support for assistance.', 403));
    }
  }

  // Update last login time
  await user.updateLastLogin();

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('role');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const verifyEmailToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verifyEmailToken,
    verifyEmailExpire: { $gt: Date.now() }
  });

  if (!user) {
    // Check if token exists but is expired
    const expiredUser = await User.findOne({
      verifyEmailToken
    });

    if (expiredUser) {
      // Generate new verification token
      const newVerificationToken = expiredUser.getEmailVerificationToken();
      await expiredUser.save({ validateBeforeSave: false });

      // Create verification url
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${newVerificationToken}`;

      try {
        await sendEmail({
          email: expiredUser.email,
          subject: 'New Email Verification Link',
          message: `Your previous verification link has expired. Please use this new link to verify your email: \n\n ${verificationUrl}`
        });

        return res.status(400).json({
          success: false,
          message: 'Verification link expired. A new verification link has been sent to your email.'
        });
      } catch (err) {
        expiredUser.verifyEmailToken = undefined;
        expiredUser.verifyEmailExpire = undefined;
        await expiredUser.save({ validateBeforeSave: false });

        return next(new AppError('Verification link expired and could not send a new one. Please request a new verification link.', 400));
      }
    }

    return next(new AppError('Invalid verification token', 400));
  }

  user.isEmailVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Invite team member
// @route   POST /api/v1/auth/invite
// @access  Private/Admin
exports.inviteMember = asyncHandler(async (req, res, next) => {
  const { email, role, position, department } = req.body;

  try {
    // Check if email already exists in organization
    const existingUser = await User.findOne({ 
      email, 
      organization: req.user.organization._id 
    });

    if (existingUser) {
      return next(new AppError('Email already exists in this organization', 400));
    }

    // Create user with pending status
    const user = await User.create({
      email,
      role,
      position,
      department,
      organization: req.user.organization._id,
      invitedBy: req.user._id,
      invitationStatus: 'pending',
      isActive: true
    });

    // Generate invitation token
    const invitationToken = user.getInvitationToken();
    await user.save();

    // Create invitation url
    const invitationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/accept-invitation/${invitationToken}`;

    const message = `You have been invited to join ${req.user.organization.name}. Please click on the link to complete your registration: \n\n ${invitationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Team Invitation',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Invitation sent successfully'
      });
    } catch (err) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return next(new AppError('Could not send invitation email', 500));
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// @desc    Accept invitation and complete registration
// @route   POST /api/v1/auth/accept-invitation/:token
// @access  Public
exports.acceptInvitation = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, password } = req.body;

  // Get hashed token
  const invitationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    invitationToken,
    invitationExpire: { $gt: Date.now() },
    invitationStatus: 'pending'
  });

  if (!user) {
    return next(new AppError('Invalid or expired invitation', 400));
  }

  // Update user information
  user.firstName = firstName;
  user.lastName = lastName;
  user.password = password;
  user.invitationStatus = 'accepted';
  user.invitationToken = undefined;
  user.invitationExpire = undefined;
  user.isEmailVerified = true; // Auto-verify email since they received the invitation

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification url
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;

  const message = `Please click on the link to verify your email: \n\n ${verificationUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (err) {
    user.verifyEmailToken = undefined;
    user.verifyEmailExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Admin verify user email
// @route   PUT /api/v1/auth/admin-verify-email/:userId
// @access  Private/Admin
exports.adminVerifyEmail = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  // Only allow admins to verify other users in their organization
  const user = await User.findOne({
    _id: userId,
    organization: req.user.organization._id
  });

  if (!user) {
    return next(new AppError('User not found or not in your organization', 404));
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailExpire = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Email for user ${user.email} has been verified by admin`
  });
});

// @desc    Check email verification status
// @route   GET /api/v1/auth/verification-status
// @access  Private
exports.checkVerificationStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      isEmailVerified: user.isEmailVerified
    }
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Create user response object without sensitive data
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    organization: user.organization,
    position: user.position,
    department: user.department,
    isEmailVerified: user.isEmailVerified,
    termsAccepted: user.termsAccepted,
    privacyPolicyAccepted: user.privacyPolicyAccepted,
    termsAcceptedAt: user.termsAcceptedAt,
    privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message: 'User registered successfully',
      token,
      data: userResponse
    });
};