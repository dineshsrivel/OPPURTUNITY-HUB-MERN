const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");

const { syncGreenhouseJobs } = require("../controllers/jobController");

router.post(
  "/greenhouse/sync",
  protect,
  authorize("admin"),
  syncGreenhouseJobs
);

module.exports = router;