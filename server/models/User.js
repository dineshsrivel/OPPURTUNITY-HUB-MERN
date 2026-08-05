const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

// ── Sub-schemas ───────────────────────────────────────────────────────────────
const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree:      { type: String, required: true },
  field:       String,
  startYear:   Number,
  endYear:     Number,
  cgpa:        String,
  current:     { type: Boolean, default: false },
});

const experienceSchema = new mongoose.Schema({
  company:     { type: String, required: true },
  role:        { type: String, required: true },
  type:        { type: String, enum: ['full-time', 'part-time', 'internship', 'freelance'], default: 'internship' },
  location:    String,
  startDate:   Date,
  endDate:     Date,
  current:     { type: Boolean, default: false },
  description: String,
});

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  techStack:   [String],
  githubUrl:   String,
  liveUrl:     String,
  year:        Number,
});

const certificationSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  issuer:        String,
  credentialId:  String,
  issueDate:     Date,
  expiryDate:    Date,
  credentialUrl: String,
});

// ── Main User Schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Name is required'],
    trim:     true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,
    lowercase: true,
    match:     [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select:    false,
  },
  role: {
    type:    String,
    enum:    ['student', 'admin'],
    default: 'student'
  },

  // ── Profile ────────────────────────────────────────────────────────────────
  avatar:   { type: String, default: '' },
  phone:    String,
  location: String,
  bio:      { type: String, maxlength: 500 },

  // ── Student-specific ───────────────────────────────────────────────────────
  skills:            [{ type: String }],
  education:         [educationSchema],
  experience:        [experienceSchema],
  projects:          [projectSchema],
  certifications:    [certificationSchema],
  resumeUrl:         String,
  resumeOriginalName:String,
  githubUrl:         String,
  linkedinUrl:       String,
  portfolioUrl:      String,
  preferredRoles:    [String],
  preferredLocations:[String],
  openToWork:        { type: Boolean, default: true },

  // ── Auth tokens ────────────────────────────────────────────────────────────
  isVerified:               { type: Boolean, default: false },
  isActive:                 { type: Boolean, default: true },
  emailVerificationToken:   String,
  emailVerificationExpire:  Date,
  passwordResetToken:       String,
  passwordResetExpire:      Date,
  lastLogin:                Date,
  loginCount:               { type: Number, default: 0 },
}, { timestamps: true });

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken  = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

userSchema.methods.getPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken  = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return token;
};

userSchema.methods.getProfileCompletion = function () {
  let score = 0;
  const checks = [
    this.name, this.email, this.phone, this.location, this.bio,
    this.skills?.length > 0, this.education?.length > 0,
    this.resumeUrl, this.avatar,
    this.githubUrl || this.linkedinUrl,
  ];
  checks.forEach(c => { if (c) score += 10; });
  return Math.min(score, 100);
};

module.exports = mongoose.model('User', userSchema);
