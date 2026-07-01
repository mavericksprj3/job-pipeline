// Member 2 — Route handler for fetching jobs from Adzuna API
const { fetchJson } = require("../utils/httpClient");

const SOURCE = "adzuna";

function toIso(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalize(job) {
  return {
    id: String(job.id),
    title: job.title || null,
    company: job.company?.display_name || null,
    location: job.location?.display_name || null,
    stack: job.category?.label || null,
    date_posted: toIso(job.created),
    link: job.redirect_url || null,
    source: SOURCE,
    type: job.contract_type || null,
    created_at: new Date().toISOString(),
  };
}

async function fetchAdzuna(page = 1) {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env;
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.error("[adzuna] missing ADZUNA_APP_ID / ADZUNA_APP_KEY environment variables");
    return [];
  }

  // US-scoped by design — country code in the path must stay "us"
  const url =
    `https://api.adzuna.com/v1/api/jobs/us/search/${page}` +
    `?app_id=${encodeURIComponent(ADZUNA_APP_ID)}` +
    `&app_key=${encodeURIComponent(ADZUNA_APP_KEY)}` +
    `&results_per_page=50&content-type=application/json`;

  try {
    const data = await fetchJson(url);
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map(normalize);
  } catch (err) {
    if (err.status === 429) {
      console.warn("[adzuna] rate limited, skipping this run");
    } else {
      console.error("[adzuna] fetch failed:", err.message);
    }
    return [];
  }
}

module.exports = { fetchAdzuna };
