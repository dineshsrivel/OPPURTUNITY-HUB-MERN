const axios = require("axios");

const fetchRemotiveFreelanceJobs = async () => {
  try {
    const url = "https://remotive.com/api/remote-jobs";
    const { data } = await axios.get(url);

    const allJobs = data.jobs || [];

    // Filter freelance/contract/part-time or gig opportunities
    const freelancingJobs = allJobs.filter((job) => {
      const jobType = (job.job_type || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      const description = (job.description || "").toLowerCase();

      return (
        jobType.includes("freelance") ||
        jobType.includes("contract") ||
        jobType.includes("part_time") ||
        title.includes("freelance") ||
        title.includes("contract") ||
        title.includes("consultant") ||
        title.includes("gig") ||
        description.includes("freelance") ||
        description.includes("contractor")
      );
    });

    // Fallback to all remote jobs if filter yields 0 so we always offer opportunities
    const targetJobs = freelancingJobs.length > 0 ? freelancingJobs : allJobs;

    const formatted = targetJobs.map((job) => ({
      title: job.title,
      companyName: job.company_name || "Unknown",
      companyLogo: job.company_logo || "",
      description: (job.description || "No description").substring(0, 6000),
      location: job.candidate_required_location || "Remote",
      workMode: "Remote",
      locationType: "remote",
      applyLink: job.url || "",
      applicationDeadline: null,
      type: "freelancing",
      category: "Freelancing",
      requiredSkills: Array.isArray(job.tags) ? job.tags : [],
      skills: Array.isArray(job.tags) ? job.tags : [],
      status: "Active",
      isActive: true,
      isFeatured: false,
      salary: job.salary || "",
      source: "Remotive"
    }));

    console.log(`✅ Remotive: ${formatted.length} freelancing opportunities fetched`);
    return formatted;
  } catch (err) {
    console.error("❌ Remotive API Error:", err.message);
    return [];
  }
};

module.exports = fetchRemotiveFreelanceJobs;
