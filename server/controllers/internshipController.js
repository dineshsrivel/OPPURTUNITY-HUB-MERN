const Opportunity = require("../models/Opportunity");
const fetchMuseInternships = require("../services/internships/muse.service");

exports.syncMuseInternships = async (req, res) => {
  try {

    const internships = await fetchMuseInternships();

    let added = 0;
    let skipped = 0;

    for (const internship of internships) {

      const exists = await Opportunity.findOne({
        title: internship.title,
        companyName: internship.companyName
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Opportunity.create(internship);
      added++;
    }

    res.json({
      success: true,
      fetched: internships.length,
      added,
      skipped
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};