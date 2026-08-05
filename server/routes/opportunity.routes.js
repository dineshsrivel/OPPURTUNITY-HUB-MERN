const express = require('express');
const router  = express.Router();
const {
  getOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, deleteOpportunity,
  toggleBookmark, getBookmarks,
} = require('../controllers/opportunity.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.get( '/',          optionalAuth, getOpportunities);
router.post('/',          protect, authorize('admin'), createOpportunity);
router.get( '/bookmarks', protect, getBookmarks);
router.get( '/:id',       optionalAuth, getOpportunity);
router.put( '/:id',       protect, authorize('admin'), updateOpportunity);
router.delete('/:id',     protect, authorize('admin'), deleteOpportunity);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
