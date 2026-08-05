const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");
const { syncRemotiveJobs } = require("../controllers/freelancingController");

router.post(
  "/remotive/sync",
  protect,
  authorize("admin"),
  syncRemotiveJobs
);

module.exports = router;
