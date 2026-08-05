const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user id
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify a JWT and return the decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Send a token response with the user object
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token   = generateToken(user._id);
  const userObj = {
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    avatar:     user.avatar,
    isVerified: user.isVerified,
    company:    user.company,
  };
  res.status(statusCode).json({ success: true, message, token, user: userObj });
};

module.exports = { generateToken, verifyToken, sendTokenResponse };
