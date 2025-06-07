#!/usr/bin/env node
const { config } = require("dotenv");

// Load environment variables
config({ path: ".env.local" });

// Import Supabase after loading env vars
const { supabase } = require("../lib/supabase");

async function testDatabase() {
  console.log("🔍 Testing Supabase database connection...\n");

  try {
    // Test connection by querying the jobs table
    const { data, error, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" });

    if (error) {
      throw error;
    }

    console.log("✅ Database connection successful!");
    console.log("✅ Jobs table exists and is accessible");
    console.log(`✅ Current job count: ${count || 0}\n`);

    // Test other tables
    const { error: progressError } = await supabase
      .from("job_progress")
      .select("*", { count: "exact" });

    if (progressError) {
      throw new Error(`job_progress table error: ${progressError.message}`);
    }

    const { error: assetsError } = await supabase
      .from("generated_assets")
      .select("*", { count: "exact" });

    if (assetsError) {
      throw new Error(`generated_assets table error: ${assetsError.message}`);
    }

    console.log(
      "✅ All tables (jobs, job_progress, generated_assets) are accessible"
    );
    console.log("🎉 Database setup is complete and ready to use!");
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);

    if (error.message.includes("PGRST301")) {
      console.error("\n💡 This usually means:");
      console.error("  - The table doesn't exist (run the schema first)");
      console.error("  - Your API keys are incorrect");
      console.error("  - Row Level Security is blocking access");
    }

    process.exit(1);
  }
}

// Run the test
testDatabase();
