// Member 2 — Route handler for fetching jobs from Himalayas API
const { fetchJson } = require("../utils/httpClient");

const SOURCE = "himalayas";
const API_URL = "https://himalayas.app/jobs/api/search";
const DEFAULT_PAGES = 5; // ~100 jobs per run instead of a single ~19-job page

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

// The live API ignores `keyword` and `offset` entirely (verified by testing —
// identical results regardless of keyword, and offset has no effect), but it
// does honor `page` for real pagination and `country` for real filtering. We
// still accept `keyword` for forward compatibility in case the API starts
// honoring it, but rely on `page` to pull enough volume per run.
async function fetchHimalayas({ keyword, country = "US", pages = DEFAULT_PAGES } = {}) {
  const seen = new Set();
  const combined = [];

  for (let page = 1; page <= pages; page++) {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (country) params.set("country", country);
    params.set("page", String(page));
    const url = `${API_URL}?${params.toString()}`;

    let data;
    try {
      data = await fetchJson(url);
    } catch (err) {
      if (err.status === 429) {
        console.warn("[himalayas] rate limited, skipping remaining pages for this run");
      } else {
        console.error(`[himalayas] fetch failed on page ${page}:`, err.message);
      }
      break;
    }

    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    if (jobs.length === 0) break; // truly out of results

    for (const job of jobs) {
      const key = job.guid || job.applicationLink;
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      combined.push(normalize(job));
    }
  }

  return combined;
}

module.exports = { fetchHimalayas };
