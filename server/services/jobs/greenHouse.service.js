const axios = require("axios");

const COMPANY_BOARDS = [
  "github",
  "stripe",
  "discord",
  "dropbox",
  "notion",
  "figma",
  "coinbase",
  "datadog"
];

const fetchGreenhouseJobs = async () => {
  let jobs = [];

  for (const company of COMPANY_BOARDS) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;

      const { data } = await axios.get(url);

      if (!data.jobs) continue;

      const formatted = data.jobs.map((job) => ({
        title: job.title,
        companyName: company.charAt(0).toUpperCase() + company.slice(1),
        description: job.content || "No description available",
        location: job.location?.name || "Remote",
        workMode: "Remote",
        applyLink: job.absolute_url,
        applicationDeadline: null,
        type: "job",
        category: "Jobs",
        requiredSkills: [],
        status: "Active",
        isActive: true,
        isFeatured: false,
        salary: "",
        source: "Greenhouse"
      }));

      jobs.push(...formatted);

      console.log(`✅ ${company}: ${formatted.length} jobs`);
    } catch (err) {
      console.log(`❌ ${company}: ${err.message}`);
    }
  }

  return jobs;
};

module.exports = fetchGreenhouseJobs;