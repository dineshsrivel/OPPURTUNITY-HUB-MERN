const axios = require("axios");

const fetchUnstopScholarships = async () => {
  let scholarships = [];
  const urlsToTry = [
    "https://unstop.com/api/public/opportunity/search-result?opportunity=scholarships&per_page=50",
    "https://unstop.com/api/public/opportunity/search-result?opportunity=scholarships&per_page=25"
  ];

  for (const url of urlsToTry) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        },
        timeout: 15000
      });

      const rawList = data?.data?.data || [];
      if (!rawList.length) continue;

      const formatted = rawList.map((item) => {
        const title = item.title || "Untitled Scholarship";
        const companyName = item.organisation?.name || item.company_name || "Scholarship Host";
        const companyLogo = item.organisation?.logo?.logo_url || item.banner_mobile?.image_url || "";
        const rawDesc = item.seo_details?.description || item.details || item.title || "No description available";
        const description = rawDesc.substring(0, 6000);
        const rawEligibility =
  typeof item.eligibility === "string"
    ? item.eligibility
    : JSON.stringify(item.eligibility || item.regnRequirements?.eligibility || "");

const eligibility =
  rawEligibility.substring(0, 2000) || "Open to eligible candidates";
        const location = item.region || "Online";
        const workMode = (location.toLowerCase().includes("online") || location.toLowerCase().includes("remote")) ? "Remote" : "Onsite";
        const applyLink = item.seo_details?.canonical_url || item.short_url || "https://unstop.com";
        const applicationDeadline = item.regnRequirements?.end_regn_dt ? new Date(item.regnRequirements.end_regn_dt) : null;
        const skills = (item.required_skills || []).map((s) => (s.skill || s.skill_name || s)).filter(Boolean);

        return {
          title,
          companyName,
          companyLogo,
          description,
          eligibility,
          location,
          workMode,
          locationType: workMode.toLowerCase(),
          applyLink,
          applicationDeadline,
          type: "scholarship",
          category: "Scholarships",
          requiredSkills: skills,
          skills,
          status: "Active",
          isActive: true,
          isFeatured: false,
          salary: "",
          source: "Scholarships API"
        };
      });

      scholarships.push(...formatted);
      console.log(`✅ Scholarships API: ${formatted.length} active scholarships fetched`);
      break; // Successfully fetched
    } catch (err) {
      console.error(`⚠️ Scholarships API URL attempt failed (${url}):`, err.message);
    }
  }

  return scholarships;
};

module.exports = fetchUnstopScholarships;
