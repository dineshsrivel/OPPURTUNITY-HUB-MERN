const express = require('express');
const router  = express.Router();
const { getPublicStats } = require('../controllers/public.controller');

// @route  GET /api/public/stats
// @access Public — no auth required
router.get('/stats', getPublicStats);

module.exports = router;
