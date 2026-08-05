const Opportunity = require('../models/Opportunity');
const Bookmark = require('../models/Bookmark');
const Application = require('../models/Application');

const buildQuery = (req) => {
  const query = {};

  if (req.query.type) query.type = req.query.type;
  if (req.query.category) query.category = req.query.category;
  if (req.query.location) query.location = { $regex: req.query.location, $options: 'i' };
  if (req.query.workMode) query.workMode = req.query.workMode;
  if (req.query.status) query.status = req.query.status;
  if (req.query.isFeatured === 'true') query.isFeatured = true;
  if (req.query.isFeatured === 'false') query.isFeatured = false;

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { companyName: { $regex: req.query.search, $options: 'i' } },
      { requiredSkills: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.salary) {
    const salaryValue = Number(req.query.salary);
    if (!Number.isNaN(salaryValue)) {
      query.$or = [
        { salaryMax: { $gte: salaryValue } },
        { salaryMin: { $gte: salaryValue } },
      ];
    }
  }

  if (req.query.deadlineFrom || req.query.deadlineTo) {
    query.applicationDeadline = {};
    if (req.query.deadlineFrom) query.applicationDeadline.$gte = new Date(req.query.deadlineFrom);
    if (req.query.deadlineTo) query.applicationDeadline.$lte = new Date(req.query.deadlineTo);
  }

  return query;
};

const getSort = (req) => {
  switch (req.query.sort) {
    case 'oldest':
      return 'createdAt';
    case 'highestSalary':
      return '-salaryMax';
    case 'deadline':
      return 'applicationDeadline';
    case 'latest':
    default:
      return '-createdAt';
  }
};

exports.getOpportunities = async (req, res, next) => {
  try {
    const query = buildQuery(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const sort = getSort(req);

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort(sort).skip(skip).limit(limit),
      Opportunity.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: opportunities.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      opportunities,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    await Opportunity.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    let isBookmarked = false;
    let hasApplied = false;
    if (req.user) {
      const [bookmark, application] = await Promise.all([
        Bookmark.findOne({ user: req.user.id, opportunity: opportunity._id }),
        Application.findOne({ student: req.user.id, opportunity: opportunity._id }),
      ]);
      isBookmarked = !!bookmark;
      hasApplied = !!application;
    }

    res.json({ success: true, opportunity, isBookmarked, hasApplied });
  } catch (err) {
    next(err);
  }
};

exports.createOpportunity = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      postedBy: req.user?.id,
      requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : (req.body.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills || req.body.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      locationType: (req.body.workMode || req.body.locationType || 'Remote').toLowerCase(),
      postedDate: req.body.postedDate ? new Date(req.body.postedDate) : new Date(),
      applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : undefined,
    };

    const opportunity = await Opportunity.create(payload);
    res.status(201).json({ success: true, message: 'Opportunity created successfully', opportunity });
  } catch (err) {
    next(err);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    if (opportunity.postedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this opportunity' });
    }

    const payload = {
      ...req.body,
      requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : (req.body.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills || req.body.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      locationType: (req.body.workMode || req.body.locationType || opportunity.workMode || 'Remote').toLowerCase(),
      postedDate: req.body.postedDate ? new Date(req.body.postedDate) : opportunity.postedDate,
      applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : opportunity.applicationDeadline,
    };

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json({ success: true, message: 'Opportunity updated', opportunity: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    if (opportunity.postedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await opportunity.deleteOne();
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const existing = await Bookmark.findOne({ user: req.user.id, opportunity: req.params.id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, isBookmarked: false, message: 'Removed from bookmarks' });
    }
    await Bookmark.create({ user: req.user.id, opportunity: req.params.id });
    res.json({ success: true, isBookmarked: true, message: 'Added to bookmarks' });
  } catch (err) {
    next(err);
  }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).populate('opportunity').sort('-createdAt');
    res.json({ success: true, bookmarks });
  } catch (err) {
    next(err);
  }
};


