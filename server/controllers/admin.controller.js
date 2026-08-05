const User        = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const Report = require('../models/Report');
const path   = require('path');

// ─── Admin dashboard stats ─────────────────────────────────────────────────
// @desc   Admin dashboard stats
// @route  GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOpportunities,
      activeOpps,
      expiredOpps,
      newOppsThisMonth,
      totalCategories,
      categoryStats,
      monthlyOpps,
      typeStats,
    ] = await Promise.all([
      User.countDocuments(),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ isActive: true, status: 'Active' }),
      Opportunity.countDocuments({ status: 'Expired' }),
      Opportunity.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Category.countDocuments(),
      Opportunity.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate([
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Per-category counts for the stats breakdown
      Opportunity.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Build a quick lookup: { Jobs: N, Internships: N, … }
    const categoryBreakdown = {};
    typeStats.forEach((t) => {
      if (t._id) categoryBreakdown[t._id] = t.count;
    });

    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt avatar');
    const recentOpps = await Opportunity.find().sort('-createdAt').limit(5);
    const recentApps = await Application.find().sort('-createdAt').limit(5)
      .populate('student', 'name email')
      .populate({ path: 'opportunity', select: 'title' });

    res.json({
      success: true,
      stats: {
        totalUsers, totalOpportunities,
        activeOpps, expiredOpps, newOppsThisMonth,
        totalCategories, categoryStats, monthlyOpps,
        typeStats, categoryBreakdown,
        jobs:          categoryBreakdown['Jobs']          || categoryBreakdown['job']          || 0,
        internships:   categoryBreakdown['Internships']   || categoryBreakdown['internship']   || 0,
        freelancing:   categoryBreakdown['Freelancing']   || categoryBreakdown['freelancing']  || 0,
        hackathons:    categoryBreakdown['Hackathons']    || categoryBreakdown['hackathon']    || 0,
        scholarships:  categoryBreakdown['Scholarships']  || categoryBreakdown['scholarship']  || 0,
      },
      recentUsers,
      recentApps,
      recentOpps,
    });
  } catch (err) { next(err); }
};

// ─── Users Management ─────────────────────────────────────────────────────────────
// @desc   Get all users (admin)
// @route  GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (role)     query.role     = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search)   query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// @desc   Toggle user active status
// @route  PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { next(err); }
};

// @desc   Delete user (admin)
// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted permanently' });
  } catch (err) { next(err); }
};

// ─── Categories Management ────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

exports.addCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Category already exists' });
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

// ─── Reports Management ───────────────────────────────────────────────────
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .populate('opportunity', 'title companyName')
      .sort('-createdAt');
    res.json({ success: true, reports });
  } catch (err) { next(err); }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status || 'reviewed' }, { new: true });
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

exports.deleteReport = async (req, res, next) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) { next(err); }
};

// ─── Announcements / Notifications ───────────────────────────────────────
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, link } = req.body;
    const students = await User.find({ role: 'student' }).select('_id');

    const notifications = students.map((student) => ({
      recipient: student._id,
      sender: req.user.id,
      type: 'system',
      title,
      message,
      link,
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Announcement sent to ${students.length} students` });
  } catch (err) { next(err); }
};

// ─── Delete ALL Opportunities ────────────────────────────────────────────────
// @desc   Permanently delete every opportunity
// @route  DELETE /api/admin/opportunities/all
exports.deleteAllOpportunities = async (req, res, next) => {
  try {
    const result = await Opportunity.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} opportunities`,
      deletedCount: result.deletedCount,
    });
  } catch (err) { next(err); }
};

// ─── Bulk Import Opportunities ───────────────────────────────────────────────
// @desc   Parse uploaded JSON / CSV file and insert opportunities in bulk
// @route  POST /api/admin/opportunities/bulk-import

/**
 * Minimal RFC-4180-compatible CSV parser.
 * Returns an array of plain objects; keys are the header row (lowercased + stripped).
 */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length < 2) return [];

  const parseRow = (line) => {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim()); current = '';
      } else { current += ch; }
    }
    fields.push(current.trim());
    return fields;
  };

  // Normalise headers: lowercase + strip spaces/underscores/hyphens
  const rawHeaders = parseRow(nonEmpty[0]);
  const headers    = rawHeaders.map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));

  const records = [];
  for (let i = 1; i < nonEmpty.length; i++) {
    const values = parseRow(nonEmpty[i]);
    if (values.every((v) => !v.trim())) continue; // skip blank rows
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] !== undefined ? values[idx] : ''; });
    records.push(obj);
  }
  return records;
}

/**
 * Map an arbitrary raw record (JSON or CSV-parsed) to our Opportunity schema.
 * Returns null if required fields (title + companyName) are missing.
 *
 * Supports many field name conventions: camelCase, snake_case, lowercase-stripped.
 */
function mapRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // Universal getter — tries exact, lowercase, snake_case, and stripped variants
  const get = (...candidates) => {
    for (const k of candidates) {
      let v;
      // exact
      v = raw[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      // lowercase
      v = raw[k.toLowerCase()];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      // snake_case from camelCase
      const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      v = raw[snake];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      // fully stripped
      const stripped = k.toLowerCase().replace(/[\s_-]+/g, '');
      v = raw[stripped];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
    return undefined;
  };

  // ── Required ──────────────────────────────────────────────────────────────
  const title = get(
    'title', 'jobTitle', 'job_title', 'opportunityTitle', 'opportunity_title',
    'position', 'role', 'name', 'jobtitle', 'opportunitytitle', 'heading',
  );
  const companyName = get(
    'companyName', 'company_name', 'company', 'organization', 'employer',
    'companyTitle', 'company_title', 'org', 'companyname', 'firm',
  );
  if (!title || !companyName) return null;

  // ── Type ──────────────────────────────────────────────────────────────────
  const validTypes = ['job','internship','freelancing','hackathon','scholarship'];
  const rawType    = (get('type', 'opportunityType', 'opportunity_type', 'category_type', 'kind') || 'job').toLowerCase().trim();
  const type       = validTypes.includes(rawType) ? rawType : 'job';

  const catMap = {
    job:'Jobs', internship:'Internships', freelancing:'Freelancing',
    hackathon:'Hackathons', scholarship:'Scholarships',
  };
  const category = get('category', 'Category') || catMap[type];

  // ── Work mode ─────────────────────────────────────────────────────────────
  const validModes = ['Remote','Hybrid','Onsite'];
  const rawMode    = (get('workMode', 'work_mode', 'mode', 'locationType', 'location_type', 'remote', 'jobType') || 'Remote').trim();
  const workMode   = validModes.find((m) => m.toLowerCase() === rawMode.toLowerCase()) || 'Remote';

  // ── Status ────────────────────────────────────────────────────────────────
  const rawStatus = (get('status', 'Status') || 'Active').trim();
  const status    = ['Active','Expired'].includes(rawStatus) ? rawStatus : 'Active';

  // ── Skills ────────────────────────────────────────────────────────────────
  const rawSkills = get('requiredSkills', 'required_skills', 'skills', 'skill', 'techStack', 'tech_stack', 'technologies');
  let requiredSkills;
  if (Array.isArray(rawSkills)) {
    requiredSkills = rawSkills.map((s) => String(s).trim()).filter(Boolean);
  } else {
    requiredSkills = (rawSkills || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }

  // ── Deadline ──────────────────────────────────────────────────────────────
  const deadlineRaw = get(
    'applicationDeadline', 'application_deadline', 'deadline',
    'applyBy', 'apply_by', 'closingDate', 'closing_date', 'lastDate', 'last_date', 'dueDate',
  );
  const applicationDeadline = deadlineRaw ? new Date(deadlineRaw) : undefined;

  // ── Salary ────────────────────────────────────────────────────────────────
  const salary       = get('salary', 'stipend', 'compensation', 'ctc', 'package', 'pay') || '';
  const salaryMinRaw = Number(get('salaryMin', 'salary_min', 'minSalary', 'min_salary'));
  const salaryMaxRaw = Number(get('salaryMax', 'salary_max', 'maxSalary', 'max_salary'));

  // ── Apply link ────────────────────────────────────────────────────────────
  const applyLink = get(
    'applyLink', 'apply_link', 'applyUrl', 'apply_url', 'url', 'link',
    'officialApplyLink', 'official_apply_link', 'applicationLink', 'application_link', 'applyNow',
  ) || '';

  // ── Description ───────────────────────────────────────────────────────────
  const description = get(
    'description', 'desc', 'jobDescription', 'job_description', 'details', 'about', 'summary',
  ) || `${title} at ${companyName}`;

  return {
    title:               title,
    companyName:         companyName,
    companyLogo:         get('companyLogo', 'company_logo', 'logo', 'logoUrl', 'logo_url', 'companyImage') || '',
    type,
    category,
    description,
    requiredSkills,
    skills:              requiredSkills,
    eligibility:         get('eligibility', 'requirements', 'criteria', 'qualification') || '',
    location:            get('location', 'city', 'place', 'area', 'address') || 'Remote',
    workMode,
    locationType:        workMode.toLowerCase(),
    salary,
    salaryMin:           !isNaN(salaryMinRaw) && salaryMinRaw > 0 ? salaryMinRaw : undefined,
    salaryMax:           !isNaN(salaryMaxRaw) && salaryMaxRaw > 0 ? salaryMaxRaw : undefined,
    applicationDeadline: applicationDeadline && !isNaN(applicationDeadline.getTime()) ? applicationDeadline : undefined,
    applyLink,
    contactEmail:        get('contactEmail', 'contact_email', 'email', 'contactMail', 'contact') || '',
    status,
    isFeatured:          String(get('isFeatured', 'is_featured', 'featured') || 'false').toLowerCase() === 'true',
    isActive:            String(get('isActive', 'is_active', 'active') || 'true').toLowerCase() !== 'false',
    postedDate:          new Date(),
  };
}

exports.bulkImportOpportunities = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext     = path.extname(req.file.originalname).toLowerCase();
    const content = req.file.buffer.toString('utf-8');
    let rawRecords = [];

    // ── Parse ────────────────────────────────────────────────────────────────
    if (ext === '.json') {
      let parsed;
      try { parsed = JSON.parse(content); }
      catch (parseErr) {
        console.error('[BulkImport] JSON parse error:', parseErr.message);
        return res.status(400).json({ success: false, message: 'Invalid JSON: ' + parseErr.message });
      }
      if (Array.isArray(parsed))                    rawRecords = parsed;
      else if (Array.isArray(parsed.opportunities)) rawRecords = parsed.opportunities;
      else if (Array.isArray(parsed.data))          rawRecords = parsed.data;
      else if (Array.isArray(parsed.records))       rawRecords = parsed.records;
      else                                          rawRecords = [parsed];
    } else if (ext === '.csv') {
      rawRecords = parseCSV(content);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type. Use .json or .csv' });
    }

    const total = rawRecords.length;
    console.log('\n[BulkImport] ─────────────────────────────────────────────────');
    console.log('[BulkImport] File        :', req.file.originalname);
    console.log('[BulkImport] Total rows  :', total);
    console.log('[BulkImport] First raw record:');
    console.log(JSON.stringify(rawRecords[0], null, 2));
    if (rawRecords[0]) {
      console.log('[BulkImport] mapRecord() of first record:');
      console.log(JSON.stringify(mapRecord(rawRecords[0]), null, 2));
    }

    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: 'No records found in file. Check format (JSON array or CSV with headers).',
      });
    }

    // ── Validate & map ───────────────────────────────────────────────────────
    const toInsert = [];
    const failed   = [];

    rawRecords.forEach((raw, idx) => {
      try {
        const mapped = mapRecord(raw);
        if (!mapped) {
          failed.push({ index: idx + 1, reason: 'Missing required fields: title and/or companyName' });
        } else {
          toInsert.push(mapped);
        }
      } catch (mapErr) {
        failed.push({ index: idx + 1, reason: 'Mapping error: ' + mapErr.message });
      }
    });

    console.log('[BulkImport] Mapped OK   :', toInsert.length);
    console.log('[BulkImport] Map failed  :', failed.length);

    if (toInsert.length === 0) {
      return res.json({
        success: true,
        total,
        imported: 0,
        skipped:  0,
        failed:   failed.length,
        errors:   failed.slice(0, 20),
        message:  'No valid records — all are missing title or companyName.',
      });
    }

    // ── Duplicate detection ──────────────────────────────────────────────────
    // Strategy: collect unique titles from the file, query MongoDB in chunks of
    // 500 using $in (safe BSON size), build an in-memory Set for fast lookup.
    // This avoids the massive $or array that exceeds MongoDB's 16MB BSON limit.

    const titleSet = [...new Set(toInsert.map((o) => o.title.toLowerCase().trim()))];
    let existingKeys = new Set();

    try {
      const CHUNK = 500;
      for (let i = 0; i < titleSet.length; i += CHUNK) {
        const chunk  = titleSet.slice(i, i + CHUNK);
        const docs   = await Opportunity
          .find({ title: { $in: chunk.map((t) => new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) } })
          .select('title companyName applyLink')
          .lean();
        docs.forEach((e) => {
          existingKeys.add([
            (e.title || '').toLowerCase().trim(),
            (e.companyName || '').toLowerCase().trim(),
            (e.applyLink || '').toLowerCase().trim(),
          ].join('||'));
        });
      }
      console.log('[BulkImport] Existing keys in DB:', existingKeys.size);
    } catch (dupErr) {
      console.error('[BulkImport] Duplicate-check failed (proceeding without):', dupErr.message);
      existingKeys = new Set(); // safe fallback — import everything
    }

    const unique = [];
    let   skipped = 0;

    toInsert.forEach((opp) => {
      const key = [
        (opp.title || '').toLowerCase().trim(),
        (opp.companyName || '').toLowerCase().trim(),
        (opp.applyLink || '').toLowerCase().trim(),
      ].join('||');
      if (existingKeys.has(key)) { skipped++; }
      else { unique.push(opp); }
    });

    console.log('[BulkImport] Unique (to insert) :', unique.length);
    console.log('[BulkImport] Skipped (duplicate) :', skipped);

    // ── Insert in batches of 500 ─────────────────────────────────────────────
    let imported     = 0;
    const insertErrors = [];
    const BATCH      = 500;

    for (let i = 0; i < unique.length; i += BATCH) {
      const batch     = unique.slice(i, i + BATCH);
      const batchNum  = Math.floor(i / BATCH) + 1;
      try {
        // rawResult:true returns the raw MongoDB BulkWriteResult instead of
        // Mongoose document array, giving us an accurate insertedCount even
        // when some documents fail schema validation.
        const result    = await Opportunity.insertMany(batch, { ordered: false, rawResult: true });

        // Mongoose 8 + rawResult:true structure:
        //   result.insertedCount  (MongoDB driver BulkWriteResult)
        //   result.mongoose.results[] (per-document outcomes)
        const nInserted = result?.insertedCount
          ?? result?.result?.insertedCount
          ?? result?.mongoose?.results?.filter((r) => r.result?.ok === 1).length
          ?? batch.length;

        imported += nInserted;
        console.log(`[BulkImport] Batch ${batchNum}: inserted ${nInserted}/${batch.length}`);
      } catch (bulkErr) {
        console.error(`[BulkImport] Batch ${batchNum} error:`, bulkErr.message);

        // When ordered:false some docs may have been inserted before the error
        const nOk = bulkErr?.result?.insertedCount
          ?? bulkErr?.result?.nInserted
          ?? bulkErr?.insertedCount
          ?? 0;
        imported += nOk;
        console.log(`[BulkImport] Batch ${batchNum} partial: ${nOk} inserted`);

        // Collect per-document errors
        const wErrs = bulkErr?.writeErrors
          || bulkErr?.result?.getWriteErrors?.()
          || [];
        wErrs.forEach((we) => {
          insertErrors.push({
            index:  i + (we.index ?? we.err?.index ?? 0) + 1,
            reason: we.errmsg || we.err?.errmsg || we.message || 'Insert error',
          });
        });
      }
    }

    const totalFailed = failed.length + insertErrors.length;

    console.log('[BulkImport] ── Final Result ────────────────────────────────────');
    console.log('[BulkImport] Total    :', total);
    console.log('[BulkImport] Imported :', imported);
    console.log('[BulkImport] Skipped  :', skipped);
    console.log('[BulkImport] Failed   :', totalFailed);
    console.log('[BulkImport] ──────────────────────────────────────────────────\n');

    res.json({
      success:  true,
      total,
      imported,
      skipped,
      failed:   totalFailed,
      errors:   [...failed, ...insertErrors].slice(0, 50),
    });
  } catch (err) {
    console.error('[BulkImport] Unhandled error:', err);
    next(err);
  }
};
