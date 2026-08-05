const express = require('express');
const router  = express.Router();
const {
  getStats, getUsers, toggleUserStatus, deleteUser,
  getCategories, addCategory, updateCategory, deleteCategory,
  getReports, resolveReport, deleteReport,
  broadcastNotification,
  deleteAllOpportunities,
  bulkImportOpportunities,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { bulkImportUpload }   = require('../middleware/upload.middleware');

const adminOnly = [protect, authorize('admin')];

// ── Stats & Dashboard ─────────────────────────────────────────────────────
router.get( '/stats',                       ...adminOnly, getStats);

// ── Users ─────────────────────────────────────────────────────────────────
router.get( '/users',                       ...adminOnly, getUsers);
router.put( '/users/:id/toggle',            ...adminOnly, toggleUserStatus);
router.delete('/users/:id',                 ...adminOnly, deleteUser);

// ── Categories ────────────────────────────────────────────────────────────
router.get( '/categories',                  ...adminOnly, getCategories);
router.post('/categories',                  ...adminOnly, addCategory);
router.put( '/categories/:id',              ...adminOnly, updateCategory);
router.delete('/categories/:id',            ...adminOnly, deleteCategory);

// ── Reports ───────────────────────────────────────────────────────────────
router.get( '/reports',                     ...adminOnly, getReports);
router.put( '/reports/:id/resolve',         ...adminOnly, resolveReport);
router.delete('/reports/:id',               ...adminOnly, deleteReport);

// ── Announcements ─────────────────────────────────────────────────────────
router.post('/notifications/broadcast',     ...adminOnly, broadcastNotification);

// ── Opportunities (admin-level bulk operations) ───────────────────────────
router.delete('/opportunities/all',         ...adminOnly, deleteAllOpportunities);
router.post(
  '/opportunities/bulk-import',
  ...adminOnly,
  bulkImportUpload,
  bulkImportOpportunities,
);

module.exports = router;

