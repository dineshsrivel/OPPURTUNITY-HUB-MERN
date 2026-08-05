const axios = require("axios");

const fetchDevpostHackathons = async () => {
  let hackathons = [];
  const urlsToTry = [
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=50",
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=25"
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

      console.log(JSON.stringify(data, null, 2));

      const rawList = data?.data?.data || [];
      if (!rawList.length) continue;

      const formatted = rawList.map((item) => {
        const title = item.title || "Untitled Hackathon";
        const companyName = item.organisation?.name || item.company_name || "Hackathon Host";
        const companyLogo = item.organisation?.logo?.logo_url || item.banner_mobile?.image_url || "";
        const rawDesc = item.seo_details?.description || item.details || item.title || "No description available";
        const description = rawDesc.substring(0, 6000);
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
          location,
          workMode,
          locationType: workMode.toLowerCase(),
          applyLink,
          applicationDeadline,
          type: "hackathon",
          category: "Hackathons",
          requiredSkills: skills,
          skills,
          status: "Active",
          isActive: true,
          isFeatured: false,
          salary: "",
          source: "Hackathons API"
        };
      });

      hackathons.push(...formatted);
      console.log(`✅ Hackathons API: ${formatted.length} active hackathons fetched`);
      break; // Successfully fetched
    } catch (err) {
      console.error(`⚠️ Hackathons API URL attempt failed (${url}):`, err.message);
    }
  }

  return hackathons;
};

module.exports = fetchDevpostHackathons;
