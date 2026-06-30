// Member 3 — Express server entry point for the fetchers API
const express = require("express");
const config = require("./config/env");

const app = express();

app.use(express.json());

// Health-check route — used by n8n and uptime monitors
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.PORT, () => {
  console.log(`fetchers-api listening on port ${config.PORT}`);
});
