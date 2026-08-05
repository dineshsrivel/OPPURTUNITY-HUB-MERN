const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification= require('../models/Notification');
const { sendApplicationUpdateEmail } = require('../services/email.service');

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Apply for an opportunity
// @route  POST /api/applications/:opportunityId
// @access Private (student)
// ──────────────────────────────────────────────────────────────────────────────
exports.apply = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity)         return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (!opportunity.isActive)return res.status(400).json({ success: false, message: 'This opportunity is no longer active' });

    const existing = await Application.findOne({ student: req.user.id, opportunity: opportunity._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this opportunity' });

    const application = await Application.create({
      student:        req.user.id,
      opportunity:    opportunity._id,

      coverLetter:    req.body.coverLetter,
      resumeSnapshot: req.user.resumeUrl,
      statusHistory:  [{ status: 'applied', note: 'Application submitted' }],
    });

    // Increment application count on opportunity
    await Opportunity.findByIdAndUpdate(opportunity._id, { $inc: { applicationCount: 1 } });

    // Notify Admin (optional, but skipping complex logic for simple tracking)

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (err) { next(err); }
};

// ──────────────────────────────────────────────────────────────────────────────
// @desc   Get my applications (student)
// @route  GET /api/applications/my
// @access Private (student)
// ──────────────────────────────────────────────────────────────────────────────
exports.getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { student: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('opportunity')
        .sort('-appliedAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);

    res.json({ success: true, applications, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};



// ──────────────────────────────────────────────────────────────────────────────
// @desc   Withdraw application (student)
// @route  DELETE /api/applications/:id
// @access Private (student)
// ──────────────────────────────────────────────────────────────────────────────
exports.withdraw = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, student: req.user.id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (!['applied', 'under_review'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage' });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({ status: 'withdrawn', note: 'Withdrawn by applicant', changedBy: req.user.id });
    await application.save();

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) { next(err); }
};
