const mongoose = require('mongoose');

const opportunityRatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
}, { timestamps: true });

// One rating per user per opportunity
opportunityRatingSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('OpportunityRating', opportunityRatingSchema);
