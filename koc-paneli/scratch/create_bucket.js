/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Attempting to create storage bucket 'monthly-reports'...");
  const { data, error } = await supabase.storage.createBucket('monthly-reports', {
    public: false,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: 10 * 1024 * 1024 // 10MB
  });
  if (error) {
    console.log("Bucket creation result (might already exist):", error.message);
  } else {
    console.log("Bucket 'monthly-reports' successfully created!", data);
  }
}

run();
