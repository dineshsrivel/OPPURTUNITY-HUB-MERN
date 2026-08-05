const User        = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Category    = require('../models/Category');

/**
 * @desc   Public platform stats — no authentication required.
 *         Used by the Landing Page to show real-time counts.
 * @route  GET /api/public/stats
 * @access Public
 */
exports.getPublicStats = async (req, res, next) => {
  try {
    const [totalOpportunities, totalStudents, totalCategories] = await Promise.all([
      Opportunity.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student' }),
      Category.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: { totalOpportunities, totalStudents, totalCategories },
    });
  } catch (err) {
    next(err);
  }
};
