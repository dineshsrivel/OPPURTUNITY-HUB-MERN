const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");
const { syncDevpostHackathons } = require("../controllers/hackathonController");

router.post(
  "/devpost/sync",
  protect,
  authorize("admin"),
  syncDevpostHackathons
);

module.exports = router;
