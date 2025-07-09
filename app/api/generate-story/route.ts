import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { jobToken } = await request.json();

    if (!jobToken) {
      return NextResponse.json(
        { error: "Job token is required" },
        { status: 400 }
      );
    }

    // Get job details from database
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("token", jobToken)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.status !== "processing") {
      return NextResponse.json(
        { error: "Job is not in processing state" },
        { status: 400 }
      );
    }

    // Generate the story using the existing generateEpisode script
    await generateStoryForJob(job);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}

interface Job {
  id: string;
  token: string;
  character_name?: string;
  character_age?: number;
  character_gender?: string;
  has_companion: boolean;
  companion_name?: string;
  companion_animal?: string;
  location?: string;
  values_morals?: string[];
  phone_number?: string;
}

async function generateStoryForJob(job: Job) {
  try {
    // Create a temporary config file for the story generation
    const configPath = path.join(process.cwd(), "temp", `${job.token}-config.json`);
    
    // Ensure temp directory exists
    await fs.mkdir(path.dirname(configPath), { recursive: true });

    // Convert job data to story config format
    const storyConfig = {
      characterName: job.character_name,
      characterAge: job.character_age,
      characterGender: job.character_gender,
      hasCompanion: job.has_companion,
      companionName: job.companion_name,
      companionAnimal: job.companion_animal,
      location: job.location,
      values: job.values_morals,
    };

    // Write the story config to a temporary file
    await fs.writeFile(configPath, JSON.stringify(storyConfig, null, 2));

    // Run the story generation script with the custom config
    const scriptPath = path.join(process.cwd(), "scripts", "generateEpisode.ts");
    const { stdout, stderr } = await execAsync(
      `npx ts-node ${scriptPath} --config ${configPath}`,
      { cwd: process.cwd() }
    );

    console.log("Story generation output:", stdout);
    if (stderr) console.error("Story generation errors:", stderr);

    // The generateEpisode script outputs files to the output directory
    // We need to find the generated files and store their paths
    const outputDir = path.join(process.cwd(), "output");
    const files = await fs.readdir(outputDir);
    
    // Find the most recent files (they should be timestamped)
    const storyFiles = files.filter(f => f.includes("story.txt"));
    const latestStoryFile = storyFiles.sort().reverse()[0];
    
    if (latestStoryFile) {
      const storyUrl = `/output/${latestStoryFile}`;
      
      // Update job with completion status
      await supabaseAdmin
        .from("jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("token", job.token);

      // Create generated asset record
      await supabaseAdmin.from("generated_assets").insert({
        job_id: job.id,
        asset_type: "story",
        s3_url: storyUrl,
        mime_type: "text/plain",
      });

      // Send SMS notification if phone number is available
      if (job.phone_number) {
        await sendCompletionSMS(job.phone_number, job.token, storyUrl);
      }
    }

    // Clean up temporary config file
    await fs.unlink(configPath).catch(() => {});
    
  } catch (error) {
    console.error("Error in story generation:", error);
    
    // Update job status to failed
    await supabaseAdmin
      .from("jobs")
      .update({ status: "failed" })
      .eq("token", job.token);
    
    throw error;
  }
}

// Send SMS notification when story is complete
async function sendCompletionSMS(phoneNumber: string, jobToken: string, storyUrl: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const message = `🌙 Your custom bedtime story is ready! Download it here: ${baseUrl}${storyUrl}`;
    
    // TODO: Implement SMS sending with Twilio
    // For now, just log the message
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}