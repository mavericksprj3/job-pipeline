// Member 3 — Loads and validates all required environment variables, exports config
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const REQUIRED_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "ANTHROPIC_API_KEY",
  "DATAFORSEO_LOGIN",
  "DATAFORSEO_PASSWORD",
  "N8N_API_KEY",
  "N8N_WEBHOOK_URL",
];

const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.example to .env and fill in the values.`
  );
}

const config = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD,
  N8N_API_KEY: process.env.N8N_API_KEY,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  PORT: parseInt(process.env.PORT, 10) || 3000,
};

module.exports = config;
