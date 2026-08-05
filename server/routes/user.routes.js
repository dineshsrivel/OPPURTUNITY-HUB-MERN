const express = require('express');
const router  = express.Router();
const {
  getProfile, getPublicProfile, updateProfile,
  uploadAvatar, uploadResume, getStudentStats, deleteAccount,
} = require('../controllers/user.controller');
const { protect, authorize }   = require('../middleware/auth.middleware');
const { uploadAvatar: multerAvatar, uploadResume: multerResume } = require('../middleware/upload.middleware');

router.get( '/profile',    protect, getProfile);
router.put( '/profile',    protect, updateProfile);
router.post('/avatar',     protect, multerAvatar, uploadAvatar);
router.post('/resume',     protect, authorize('student'), multerResume, uploadResume);
router.get( '/stats',      protect, authorize('student'), getStudentStats);
router.delete('/account',  protect, deleteAccount);
router.get( '/:id',        getPublicProfile);

module.exports = router;
