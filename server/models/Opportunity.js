const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  companyName: { type: String, required: true, trim: true },
  companyLogo: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  type: {
    type: String,
    required: [true, 'Opportunity type is required'],
    enum: ['job', 'internship', 'freelancing', 'hackathon', 'scholarship'],
    default: 'job',
  },
  category: {
    type: String,
    enum: ['Jobs', 'Internships', 'Freelancing', 'Hackathons', 'Scholarships'],
    default: 'Jobs',
  },

  description: { type: String, required: [true, 'Description is required'], maxlength: 6000 },
  requiredSkills: [{ type: String, trim: true }],
  eligibility: { type: String, maxlength: 2000 },
  location: { type: String, default: 'Remote' },
  workMode: { type: String, enum: ['Remote', 'Hybrid', 'Onsite'], default: 'Remote' },
  salary: { type: String },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  applicationDeadline: { type: Date },
  applyLink: { type: String },
  contactEmail: { type: String, trim: true },
  postedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  isFeatured: { type: Boolean, default: false },
  skills: [{ type: String, trim: true }],
  locationType: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote' },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },

  // Flag to identify demo-generated opportunities
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });

opportunitySchema.pre('save', function (next) {
  if (!this.skills || this.skills.length === 0) {
    this.skills = this.requiredSkills || [];
  }
  if (!this.requiredSkills || this.requiredSkills.length === 0) {
    this.requiredSkills = this.skills || [];
  }
  if (!this.locationType) {
    this.locationType = this.workMode?.toLowerCase();
  }
  next();
});

opportunitySchema.index({ title: 'text', description: 'text', requiredSkills: 'text', companyName: 'text' });
opportunitySchema.index({ category: 1, workMode: 1, location: 1, status: 1, isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
