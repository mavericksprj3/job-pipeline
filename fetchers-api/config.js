require('dotenv').config();

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
  n8nApiKey: process.env.N8N_API_KEY,
};

const required = ['supabaseUrl', 'supabaseKey', 'n8nWebhookUrl', 'n8nApiKey'];
const missing = required.filter((key) => !config[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = config;
