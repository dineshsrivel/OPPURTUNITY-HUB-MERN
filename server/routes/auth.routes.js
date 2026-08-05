const express = require('express');
const router  = express.Router();
const {
  register, login, logout, verifyEmail,
  forgotPassword, resetPassword, getMe, updatePassword,
} = require('../controllers/auth.controller');
const { protect }     = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register',        authLimiter, register);
router.post('/login',           authLimiter, login);
router.post('/logout',          protect, logout);
router.get( '/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put( '/reset-password/:token', resetPassword);
router.get( '/me',              protect, getMe);
router.put( '/update-password', protect, updatePassword);

module.exports = router;
