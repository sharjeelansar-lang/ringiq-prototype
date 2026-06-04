/**
 * Seeds the ringiq-admin-portal database.
 * Creates collections + indexes, then upserts the initial admin user.
 * Run once: node scripts/seed-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const candidates = ['.env.local', '.env'];
  for (const file of candidates) {
    const envPath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(envPath)) continue;
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
    break;
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

  console.log(`Connecting to database: ${dbName}`);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // ── Collections + indexes ──────────────────────────────────────────────────

  // users
  await db.createCollection('users').catch(() => {});
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  console.log('✓ users collection ready');

  // queue — onboarding submissions from the public form
  await db.createCollection('queue').catch(() => {});
  await db.collection('queue').createIndex({ createdAt: -1 });
  await db.collection('queue').createIndex({ status: 1 });
  await db.collection('queue').createIndex({ email: 1 });
  console.log('✓ queue collection ready');

  // offices — live deployed offices
  await db.createCollection('offices').catch(() => {});
  await db.collection('offices').createIndex({ createdAt: -1 });
  await db.collection('offices').createIndex({ officeStatus: 1 });
  await db.collection('offices').createIndex({ 'twilioNumbers.number': 1 });
  console.log('✓ offices collection ready');

  // ── Admin user ─────────────────────────────────────────────────────────────

  const email         = 'admin@ringiq.ai';
  const plainPassword = 'ringiq2024';
  const passwordHash  = await bcrypt.hash(plainPassword, 12);

  const result = await db.collection('users').updateOne(
    { email },
    {
      $set: { passwordHash },
      $setOnInsert: {
        email,
        name:      'Admin',
        role:      'admin',
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  if (result.upsertedCount > 0) {
    console.log('✓ Admin user created');
  } else {
    console.log('ℹ Admin user already exists — skipped');
  }

  console.log('');
  console.log('  Login credentials:');
  console.log(`  Email    : ${email}`);
  console.log(`  Password : ${plainPassword}`);
  console.log('');
  console.log('  Change this password after first login to production.');

  await client.close();
}

seed().catch((err) => { console.error(err); process.exit(1); });
