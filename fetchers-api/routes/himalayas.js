// Member 2 — Route handler for fetching jobs from Himalayas API
const { fetchJson } = require("../utils/httpClient");

const SOURCE = "himalayas";
const API_URL = "https://himalayas.app/jobs/api/search";

function toIso(epochSeconds) {
  if (!epochSeconds) return null;
  const d = new Date(epochSeconds * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalize(job) {
  return {
    id: job.guid || job.applicationLink || null,
    title: job.title || null,
    company: job.companyName || null,
    location:
      Array.isArray(job.locationRestrictions) && job.locationRestrictions.length
        ? job.locationRestrictions.join(", ")
        : null,
    stack: Array.isArray(job.categories) && job.categories.length ? job.categories.join(", ") : null,
    date_posted: toIso(job.pubDate),
    link: job.applicationLink || null,
    source: SOURCE,
    type: job.employmentType || null,
    created_at: new Date().toISOString(),
  };
}

async function fetchHimalayas({ keyword, country = "US" } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (country) params.set("country", country);
  const url = `${API_URL}?${params.toString()}`;

  try {
    const data = await fetchJson(url);
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs.map(normalize);
  } catch (err) {
    if (err.status === 429) {
      console.warn("[himalayas] rate limited, skipping this run");
    } else {
      console.error("[himalayas] fetch failed:", err.message);
    }
    return [];
  }
}

module.exports = { fetchHimalayas };
