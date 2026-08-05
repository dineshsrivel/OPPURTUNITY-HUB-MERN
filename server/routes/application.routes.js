const express = require('express');
const router  = express.Router();
const {
  apply, getMyApplications, withdraw,
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/:opportunityId',              protect, authorize('student'), apply);
router.get( '/my',                          protect, authorize('student'), getMyApplications);
router.delete('/:id',                       protect, authorize('student'), withdraw);

module.exports = router;
