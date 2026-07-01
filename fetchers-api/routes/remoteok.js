// Member 2 — Route handler for fetching jobs from RemoteOK API
const { fetchJson } = require("../utils/httpClient");

const SOURCE = "remoteok";
const API_URL = "https://remoteok.com/api";

function toIso(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalize(job) {
  return {
    id: String(job.id),
    title: job.position || null,
    company: job.company || null,
    location: job.location || null,
    stack: Array.isArray(job.tags) && job.tags.length ? job.tags.join(", ") : null,
    date_posted: toIso(job.date),
    link: job.url || null,
    source: SOURCE,
    type: null, // RemoteOK does not expose an employment-type field
    created_at: new Date().toISOString(),
  };
}

async function fetchRemoteOk() {
  try {
    const data = await fetchJson(API_URL);
    // First element is a metadata/legal-notice object, not a job — skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];
    return jobs.map(normalize);
  } catch (err) {
    if (err.status === 429) {
      console.warn("[remoteok] rate limited, skipping this run");
    } else {
      console.error("[remoteok] fetch failed:", err.message);
    }
    return [];
  }
}

module.exports = { fetchRemoteOk };
