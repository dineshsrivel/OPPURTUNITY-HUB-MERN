const Opportunity = require("../models/Opportunity");
const fetchUnstopScholarships = require("../services/scholarships/scholarship.service");

exports.syncScholarships = async (req, res) => {
  try {
    const scholarships = await fetchUnstopScholarships();

    let added = 0;
    let skipped = 0;

    for (const scholarship of scholarships) {
      const exists = await Opportunity.findOne({
        title: scholarship.title,
        companyName: scholarship.companyName
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Opportunity.create(scholarship);
      added++;
    }

    res.json({
      success: true,
      fetched: scholarships.length,
      added,
      skipped
    });

  } catch (err) {
    console.error("Error syncing scholarships:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
