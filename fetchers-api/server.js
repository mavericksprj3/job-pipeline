// express server entry point for the fetchers API
const express = require("express");
const config = require("./config/env");

const app = express();

app.use(express.json());
app.use('/', greenhouseRouter);
app.use('/', leverRouter);

// Health-check route — used by n8n and uptime monitors
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Each fetch module already catches its own errors and resolves to an empty
// array on failure, so these routes always respond 200 — failures are visible
// in the server logs (via console.error/console.warn in the fetch modules)
// rather than surfaced as a failed HTTP request.
app.get("/fetch/remoteok", async (_req, res) => {
  const jobs = await fetchRemoteOk();
  res.json({ source: "remoteok", count: jobs.length, jobs });
});

app.get("/fetch/adzuna", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const jobs = await fetchAdzuna(page);
  res.json({ source: "adzuna", count: jobs.length, jobs });
});

app.get("/fetch/himalayas", async (req, res) => {
  const { keyword, country = "US" } = req.query;
  const jobs = await fetchHimalayas({ keyword, country });
  res.json({ source: "himalayas", count: jobs.length, jobs });
});

app.listen(config.PORT, () => {
  console.log(`fetchers-api listening on port ${config.PORT}`);
});
