// route handler for fetching jobs from Lever ATS boards
const express = require('express');
const router = express.Router();

// Seed list of companies known to use Lever.
// TODO: replace with a query to Supabase `companies` table once
// Day 3's auto-growing company list is live.
const LEVER_COMPANIES = [
  'netflix', 'shopify', 'palantir', 'lyft', 'box',
  'plaid', 'brex', 'ramp', 'rippling', 'attentive'
];

function normalizeLeverJob(job, company) {
  return {
    id: `lever_${job.id}`,
    title: job.text || null,
    company,
    location: job.categories?.location || null,
    stack: null,
    date_posted: job.createdAt
      ? new Date(job.createdAt).toISOString()
      : null,
    link: job.hostedUrl || null,
    source: 'lever',
    type: job.categories?.commitment || null,
    created_at: new Date().toISOString()
  };
}

async function fetchOneCompany(company) {
  let allJobs = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const url = `https://api.lever.co/v0/postings/${company}?mode=json&limit=${limit}&skip=${skip}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`[lever] ${company} failed: ${res.status}`);
      break;
    }

    const jobs = await res.json();
    if (!Array.isArray(jobs) || jobs.length === 0) break;

    allJobs = allJobs.concat(jobs.map(j => normalizeLeverJob(j, company)));

    if (jobs.length < limit) break;
    skip += limit;
  }

  return allJobs;
}

async function fetchLever(companySlugs = LEVER_COMPANIES) {
  const results = await Promise.allSettled(
    companySlugs.map(slug => fetchOneCompany(slug))
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

router.get('/fetch/lever', async (req, res) => {
  try {
    const jobs = await fetchLever();
    res.json({ count: jobs.length, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Lever jobs' });
  }
});

module.exports = router;
module.exports.fetchLever = fetchLever;