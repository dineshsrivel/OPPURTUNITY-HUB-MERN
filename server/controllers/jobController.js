const Opportunity = require("../models/Opportunity");
const fetchGreenhouseJobs = require("../services/jobs/greenhouse.service");

exports.syncGreenhouseJobs = async (req, res) => {
  try {

    const jobs = await fetchGreenhouseJobs();

    let added = 0;
    let skipped = 0;

    for (const job of jobs) {

      const exists = await Opportunity.findOne({
        title: job.title,
        companyName: job.companyName
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Opportunity.create(job);
      added++;
    }

    res.json({
      success: true,
      fetched: jobs.length,
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