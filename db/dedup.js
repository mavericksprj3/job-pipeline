// deduplication logic to prevent duplicate job listings in the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Checks if a job already exists in job_pool by (link, company).
 */
async function jobExists(link, company) {
  const { data, error } = await supabase
    .from('job_pool')
    .select('id')
    .eq('link', link)
    .eq('company', company)
    .maybeSingle();

  if (error) {
    throw new Error(`jobExists check failed: ${error.message}`);
  }

  return data;
}

/**
 * Inserts a job only if it doesn't already exist.
 */
async function insertJobIfNew(job) {
  const existing = await jobExists(job.link, job.company);

  if (existing) {
    return { inserted: false, job: existing };
  }

  const { data, error } = await supabase
    .from('job_pool')
    .insert([job])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { inserted: false, job: null };
    }
    throw new Error(`Insert failed: ${error.message}`);
  }

  return { inserted: true, job: data };
}

module.exports = { jobExists, insertJobIfNew };