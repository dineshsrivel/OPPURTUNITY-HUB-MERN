const path    = require('path');
const fs      = require('fs');
const User    = require('../models/User');
const Application = require('../models/Application');
const Bookmark    = require('../models/Bookmark');

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get public profile by id
// @route  GET /api/users/:id
// @access Public
// ──────────────────────────────────────────────────────────────────────────────
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-emailVerificationToken -emailVerificationExpire -passwordResetToken -passwordResetExpire -loginCount');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Update profile
// @route  PUT /api/users/profile
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    console.log(`[Profile Update] User: ${req.user?.id || req.user?._id}`, req.body);
    const allowedFields = [
      'name', 'phone', 'location', 'bio', 'skills', 'education', 'experience',
      'projects', 'certifications', 'githubUrl', 'linkedinUrl', 'portfolioUrl',
      'preferredRoles', 'preferredLocations', 'openToWork',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new:          true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('[Profile Update Error]:', err);
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Upload avatar
// @route  POST /api/users/avatar
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image file' });

    // Delete old avatar if not default
    const currentUser = await User.findById(req.user.id);
    if (currentUser.avatar && currentUser.avatar.startsWith('/uploads')) {
      const oldPath = path.join(__dirname, '..', currentUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });

    res.json({ success: true, message: 'Avatar uploaded successfully', avatarUrl, user });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Upload resume
// @route  POST /api/users/resume
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF, DOC, or DOCX file' });

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, {
      resumeUrl,
      resumeOriginalName: req.file.originalname,
    }, { new: true });

    res.json({ success: true, message: 'Resume uploaded successfully', resumeUrl, user });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get user dashboard stats
// @route  GET /api/users/stats
// @access Private (student)
// ──────────────────────────────────────────────────────────────────────────────
exports.getStudentStats = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23,59,59,999);

    const [totalApps, appsByStatus, bookmarkCount, profileCompletion, totalOpportunities, deadlinesThisWeek] = await Promise.all([
      Application.countDocuments({ student: req.user.id }),
      Application.aggregate([
        { $match: { student: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Bookmark.countDocuments({ user: req.user.id }),
      Promise.resolve(req.user.getProfileCompletion ? req.user.getProfileCompletion() : 0),
      require('../models/Opportunity').countDocuments({ isActive: true }),
      require('../models/Opportunity').countDocuments({ isActive: true, deadline: { $gte: startOfWeek, $lte: endOfWeek } }),
    ]);

    const statusMap = {};
    appsByStatus.forEach(item => { statusMap[item._id] = item.count; });

    res.json({
      success: true,
      stats: {
        totalApplications: totalApps,
        totalOpportunities,
        deadlinesThisWeek,
        applied:      statusMap['applied']      || 0,
        underReview:  statusMap['under_review'] || 0,
        interview:    statusMap['interview']    || 0,
        selected:     statusMap['selected']     || 0,
        rejected:     statusMap['rejected']     || 0,
        bookmarks:    bookmarkCount,
        profileCompletion,
      },
    });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Delete account
// @route  DELETE /api/users/account
// @access Private
// ──────────────────────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) { next(err); }
};
