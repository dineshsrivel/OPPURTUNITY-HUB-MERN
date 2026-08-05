const Opportunity = require("../models/Opportunity");
const fetchDevpostHackathons = require("../services/hackathons/devpost.service");

exports.syncDevpostHackathons = async (req, res) => {
  try {
    const hackathons = await fetchDevpostHackathons();

    let added = 0;
    let skipped = 0;

    for (const hackathon of hackathons) {
      const exists = await Opportunity.findOne({
        title: hackathon.title,
        companyName: hackathon.companyName
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Opportunity.create(hackathon);
      added++;
    }

    res.json({
      success: true,
      fetched: hackathons.length,
      added,
      skipped
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
