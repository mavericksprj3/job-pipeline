// route handler for fetching jobs from Greenhouse ATS boards
const express = require('express');
const router = express.Router();

// Seed list of companies known to use Greenhouse.
// TODO: replace with a query to Supabase `companies` table once
// Day 3's auto-growing company list is live.
const GREENHOUSE_COMPANIES = [
  'stripe', 'airbnb', 'coinbase', 'doordash', 'robinhood',
  'discord', 'figma', 'notion', 'twitch', 'reddit'
];

function normalizeGreenhouseJob(job, boardToken) {
  return {
    id: `greenhouse_${job.id}`,
    title: job.title || null,
    company: boardToken,
    location: job.location?.name || null,
    stack: null,
    date_posted: job.updated_at || null,
    link: job.absolute_url || null,
    source: 'greenhouse',
    type: null,
    created_at: new Date().toISOString()
  };
}

async function fetchOneBoard(boardToken) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error(`[greenhouse] ${boardToken} failed: ${res.status}`);
    return [];
  }

  const data = await res.json();
  const jobs = data.jobs || [];
  return jobs.map(j => normalizeGreenhouseJob(j, boardToken));
}

async function fetchGreenhouse(companySlugs = GREENHOUSE_COMPANIES) {
  const results = await Promise.allSettled(
    companySlugs.map(slug => fetchOneBoard(slug))
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

router.get('/fetch/greenhouse', async (req, res) => {
  try {
    const jobs = await fetchGreenhouse();
    res.json({ count: jobs.length, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Greenhouse jobs' });
  }
});

module.exports = router;
module.exports.fetchGreenhouse = fetchGreenhouse;