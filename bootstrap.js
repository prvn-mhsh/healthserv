/**
 * Bootstrap file for PM2-safe environment variable loading
 *
 * This file loads dotenv BEFORE any ESM imports are resolved.
 *
 * Run locally:
 *   node bootstrap.js
 *
 * With PM2:
 *   pm2 start bootstrap.js --name healthserv
 *
 * Alternative (without bootstrap):
 *   node -r dotenv/config src/server.js
 */

import dotenv from 'dotenv';

// 1️⃣ Load environment variables FIRST
const result = dotenv.config();

if (result.error && process.env.NODE_ENV !== 'production') {
  console.warn('[BOOTSTRAP] Warning: .env file not loaded');
  console.warn(result.error.message);
}

// 2️⃣ Validate required environment variables
const REQUIRED_ENV_VARS = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'NODE_ENV'
];

const missingVars = REQUIRED_ENV_VARS.filter(
  (key) => !process.env[key]
);

if (missingVars.length > 0) {
  console.error('\n❌ Startup aborted: Missing environment variables\n');
  missingVars.forEach((key) => {
    console.error(`  - ${key}`);
  });
  console.error('\nSet them via .env or your deployment environment.\n');
  process.exit(1);
}

// 3️⃣ Start the server ONLY after env is ready
try {
  await import('./src/server.js');
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
