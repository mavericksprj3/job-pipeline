// Shared fetch helper used by every job-source module.
// Retries a failed request once after a 1s delay. HTTP 429 responses are not
// retried (a 1s wait won't clear a rate limit) but are thrown with a `status`
// property so callers can detect and handle them specifically.
async function fetchJson(url, options = {}) {
  const attempt = async () => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} from ${url}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  };

  try {
    return await attempt();
  } catch (err) {
    if (err.status === 429) throw err;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return attempt();
  }
}

module.exports = { fetchJson };
