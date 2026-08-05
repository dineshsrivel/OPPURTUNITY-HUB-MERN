const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");
const { syncScholarships } = require("../controllers/scholarshipController");

router.post(
  "/sync",
  protect,
  authorize("admin"),
  syncScholarships
);

module.exports = router;
