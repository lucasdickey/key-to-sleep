import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook, extractPhoneNumber } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature and get event
    const event = await handleStripeWebhook(body, signature);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const jobToken = session.metadata?.job_token;
  
  if (!jobToken) {
    console.error("No job token found in checkout session metadata");
    return;
  }

  try {
    // Extract phone number from session
    const phoneNumber = extractPhoneNumber(session);

    // Update job status to paid and add phone number if collected
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({
        status: "processing",
        phone_number: phoneNumber,
        stripe_session_id: session.id,
      })
      .eq("token", jobToken);

    if (error) throw error;

    // Trigger story generation
    await startStoryGeneration(jobToken);
    
    console.log(`Payment successful for job ${jobToken}, story generation started`);
  } catch (error) {
    console.error(`Error handling checkout completion for job ${jobToken}:`, error);
  }
}

// Handle successful payment intent
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  // Payment Links use checkout.session.completed, so this is mainly for direct payments
}

// Handle failed payment intent
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  
  // Try to find job by payment intent and mark as failed
  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({ status: "failed" })
      .eq("stripe_session_id", paymentIntent.id);

    if (error) throw error;
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

// Start story generation process
async function startStoryGeneration(jobToken: string) {
  try {
    // Trigger background story generation
    const generateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-story`;
    
    // Use fetch to trigger the generation endpoint
    fetch(generateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobToken }),
    }).catch((error) => {
      console.error("Error triggering story generation:", error);
    });

  } catch (error) {
    console.error("Error starting story generation:", error);
  }
}
