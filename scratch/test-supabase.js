const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse env file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? "";

console.log("Supabase URL:", supabaseUrl);
console.log("Anon Key Length:", supabaseAnonKey.length);
console.log("Service Role Key Length:", supabaseServiceRoleKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

async function test() {
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return;
    }
    console.log("Buckets:", buckets);

    const hasMarketing = buckets.some(b => b.name === 'marketing-assets');
    if (!hasMarketing) {
      console.log("Bucket 'marketing-assets' does not exist. Attempting to create it...");
      const { data, error } = await supabase.storage.createBucket('marketing-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 12 * 1024 * 1024
      });
      if (error) {
        console.error("Error creating bucket:", error);
      } else {
        console.log("Bucket created successfully:", data);
      }
    } else {
      console.log("Bucket 'marketing-assets' exists!");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

test();
