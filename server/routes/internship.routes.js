const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");
const { syncMuseInternships } = require("../controllers/internshipController");

router.post(
  "/muse/sync",
  protect,
  authorize("admin"),
  syncMuseInternships
);

module.exports = router;