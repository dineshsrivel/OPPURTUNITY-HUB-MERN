const axios = require("axios");

const fetchMuseInternships = async () => {
  let internships = [];
  let page = 1;
  let hasNext = true;
  const maxPages = 15; // 15 pages * 20 results = 300 internship listings

  while (hasNext && page <= maxPages) {
    try {
      const { data } = await axios.get(
        `https://www.themuse.com/api/public/jobs?level=Internship&page=${page}`
      );

      const jobs = data.results || [];

      const formatted = jobs.map(job => ({
        title: job.name,
        companyName: job.company?.name || "Unknown",
        description: (job.contents || "No description").substring(0, 6000),
        location: job.locations?.length
          ? job.locations[0].name
          : "Remote",
        workMode: "Hybrid",
        applyLink: job.refs?.landing_page || "",
        applicationDeadline: null,
        type: "internship",
        category: "Internships",
        requiredSkills: [],
        status: "Active",
        isActive: true,
        isFeatured: false,
        salary: "",
        source: "The Muse"
      }));

      internships.push(...formatted);

      console.log(
        `Page ${page}: ${formatted.length} internships fetched`
      );

      hasNext = page < (data.page_count || 0);
      page++;

    } catch (err) {
      console.error("Error fetching Muse internships page " + page + ":", err.message);
      break;
    }
  }

  return internships;
};

module.exports = fetchMuseInternships;