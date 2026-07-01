// express server entry point for the fetchers API
const express = require("express");
const config = require("./config/env");
const greenhouseRouter = require('./routes/greenhouse');
const leverRouter = require('./routes/lever');

const app = express();

app.use(express.json());
app.use('/', greenhouseRouter);
app.use('/', leverRouter);

// Health-check route — used by n8n and uptime monitors
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.PORT, () => {
  console.log(`fetchers-api listening on port ${config.PORT}`);
});
