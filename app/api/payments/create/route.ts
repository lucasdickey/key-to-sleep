import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyConfig, phoneNumber } = body;

    // Validate required fields
    if (!storyConfig) {
      return NextResponse.json(
        { error: "Story configuration is required" },
        { status: 400 }
      );
    }

    // Generate unique job token
    const jobToken = uuidv4();

    // Create job record in database
    const { error } = await supabaseAdmin.from("jobs").insert({
      token: jobToken,
      status: "pending",
      // Map story config to database fields
      character_name: storyConfig.characterName,
      character_age: storyConfig.characterAge,
      character_gender: storyConfig.characterGender,
      has_companion: storyConfig.hasCompanion,
      companion_name: storyConfig.companionName,
      companion_animal: storyConfig.companionAnimal,
      location: storyConfig.location,
      values_morals: storyConfig.values,
      phone_number: phoneNumber || null,
    });

    if (error) throw error;

    // Create success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/success?job_token=${jobToken}`;
    const cancelUrl = `${baseUrl}/cancel`;

    // Create Stripe payment link
    const paymentLink = await createPaymentLink(
      jobToken,
      successUrl,
      cancelUrl,
      phoneNumber
    );

    return NextResponse.json({
      success: true,
      paymentUrl: paymentLink.url,
      jobToken,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}