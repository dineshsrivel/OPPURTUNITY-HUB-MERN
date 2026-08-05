const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Avatar storage ─────────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

// ── Resume storage ─────────────────────────────────────────────────────────────
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${req.user.id}-${Date.now()}${ext}`);
  },
});

// ── Logo storage ───────────────────────────────────────────────────────────────
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/logos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

// ── File filters ───────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'), false);
  }
  cb(null, true);
};

const resumeFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
  cb(null, true);
};

// ── Multer instances ───────────────────────────────────────────────────────────
exports.uploadAvatar = multer({
  storage:    avatarStorage,
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('avatar');

exports.uploadResume = multer({
  storage:    resumeStorage,
  fileFilter: resumeFilter,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('resume');

exports.uploadLogo = multer({
  storage:    logoStorage,
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('logo');

// ── Bulk Import (JSON / CSV) – memory storage ──────────────────────────────
const bulkImportFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.json', '.csv'].includes(ext)) {
    return cb(new Error('Only .json and .csv files are supported for bulk import'), false);
  }
  cb(null, true);
};

exports.bulkImportUpload = multer({
  storage:    multer.memoryStorage(),
  fileFilter: bulkImportFilter,
  limits:     { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).single('file');

