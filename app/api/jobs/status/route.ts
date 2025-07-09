import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Job token is required" },
        { status: 400 }
      );
    }

    // Find job by token
    const { data: job, error } = await supabase
      .from("jobs")
      .select("token, status, created_at, completed_at")
      .eq("token", token)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Calculate estimated completion time if still processing
    let estimated_completion;
    if (job.status === "processing") {
      const createdTime = new Date(job.created_at).getTime();
      const estimatedDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
      const estimatedComplete = new Date(createdTime + estimatedDuration);
      estimated_completion = estimatedComplete.toISOString();
    }

    // Get story URL from generated assets if completed
    let story_url;
    if (job.status === "completed") {
      const { data: assets } = await supabase
        .from("generated_assets")
        .select("s3_url")
        .eq("job_id", job.token)
        .eq("asset_type", "story")
        .single();
      
      story_url = assets?.s3_url;
    }

    return NextResponse.json({
      ...job,
      story_url,
      estimated_completion,
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}