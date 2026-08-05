const crypto = require('crypto');
const User   = require('../models/User');
const { sendTokenResponse }              = require('../services/token.service');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/email.service');

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Only allow student from public registration
    const userRole = 'student';

    const user = await User.create({ name, email, password, role: userRole });

    // Generate email verification token and save (non-blocking)
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Fire-and-forget: do NOT await email — SMTP timeout must never block the API response
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    sendVerificationEmail(user.email, user.name, verifyUrl)
      .catch((emailErr) => console.error('Verification email failed:', emailErr.message));

    sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Login user
// @route  POST /api/auth/login
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
    }

    user.lastLogin  = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Logout (client-side — just confirm)
// @route  POST /api/auth/logout
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Verify email address
// @route  GET /api/auth/verify-email/:token
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken:  hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Verification link is invalid or has expired' });
    }

    user.isVerified              = true;
    user.emailVerificationToken  = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Fire-and-forget welcome email
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    res.json({ success: true, message: 'Email verified successfully! You can now sign in.' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Forgot password — send reset link
// @route  POST /api/auth/forgot-password
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address' });
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (err) {
      user.passwordResetToken  = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Reset password with token
// @route  PUT /api/auth/reset-password/:token
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    user.password            = password;
    user.passwordResetToken  = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get current logged-in user
// @route  GET /api/auth/me
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Update password (logged in)
// @route  PUT /api/auth/update-password
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
