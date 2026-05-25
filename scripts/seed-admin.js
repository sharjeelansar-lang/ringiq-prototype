/**
 * Creates the initial admin user in MongoDB.
 * Run once: node scripts/seed-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Manually parse .env (no dotenv dependency needed)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function seed() {
  loadEnv();

  const uri    = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error('MONGODB_URI or MONGODB_DB missing from .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const email        = 'admin@ringiq.ai';
  const plainPassword = 'ringiq2024';
  const passwordHash  = await bcrypt.hash(plainPassword, 12);

  const result = await db.collection('users').updateOne(
    { email },
    {
      $setOnInsert: {
        email,
        name:         'Admin',
        role:         'admin',
        passwordHash,
        createdAt:    new Date(),
      },
    },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log('✓ Admin user created');
  } else {
    console.log('ℹ Admin user already exists — skipped');
  }

  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${plainPassword}`);

  await client.close();
}

seed().catch((err) => { console.error(err); process.exit(1); });
