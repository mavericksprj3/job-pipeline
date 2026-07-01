// Member 2 — Route handler for fetching jobs via DataForSEO Google Jobs Live Advanced API
const express = require('express');
const router = express.Router();

const API_URL = 'https://api.dataforseo.com/v3/serp/google/jobs/live/advanced';

function normalizeSerpJob(item) {
  return {
    title: item.title || null,
    company: item.employer_name || null,
    location: item.job_location || null,
    link: item.url || null,
    source: 'dataforseo',
    date_posted: item.posted_date || null,
    type: 'unknown'
  };
}

async function callDataForSeo(query, location) {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = process.env;
  const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ keyword: query, location_name: location, language_code: 'en' }])
  });

  if (!res.ok) {
    const err = new Error(`DataForSEO HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

async function fetchSerpJobs(query, location = 'United States') {
  let data;
  try {
    data = await callDataForSeo(query, location);
  } catch (err) {
    if (err.status === 429) {
      console.warn('[serp] rate limited, retrying once after 2s');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        data = await callDataForSeo(query, location);
      } catch (retryErr) {
        console.error('[serp] fetch failed after retry:', retryErr.message);
        return [];
      }
    } else {
      console.error('[serp] fetch failed:', err.message);
      return [];
    }
  }

  const items = data && data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]
    ? data.tasks[0].result[0].items
    : null;

  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map(normalizeSerpJob);
}

router.get('/fetch/serp', async (req, res) => {
  const { query, location } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing required query parameter: query' });
  }

  const jobs = await fetchSerpJobs(query, location || undefined);
  res.json({ count: jobs.length, jobs });
});

module.exports = router;
module.exports.fetchSerpJobs = fetchSerpJobs;
