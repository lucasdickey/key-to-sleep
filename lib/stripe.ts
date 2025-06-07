import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Product and price configuration
const PRODUCT_ID = process.env.STRIPE_PRODUCT_ID;
const PRICE_ID = process.env.STRIPE_PRICE_ID;

// Create a payment link for a custom sleep story
export async function createPaymentLink(
  jobToken: string,
  successUrl: string,
  cancelUrl: string,
  phoneNumber?: string
): Promise<Stripe.PaymentLink> {
  if (!PRICE_ID) {
    throw new Error("Stripe price ID not configured");
  }

  try {
    // Create or retrieve customer if phone number provided
    let customerId: string | undefined;

    if (phoneNumber) {
      // Search for existing customer by phone
      const existingCustomers = await stripe.customers.list({
        limit: 1,
        email: `${phoneNumber}@phone.placeholder`, // Using phone as pseudo-email for lookup
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          phone: phoneNumber,
          email: `${phoneNumber}@phone.placeholder`,
          metadata: {
            phone_number: phoneNumber,
            job_token: jobToken,
          },
        });
        customerId = customer.id;
      }
    }

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: successUrl,
        },
      },
      metadata: {
        job_token: jobToken,
      },
      ...(customerId && { customer: customerId }),
      // Add phone number collection if not already provided
      ...(!phoneNumber && {
        custom_fields: [
          {
            key: "phone_number",
            label: {
              type: "custom",
              custom: "Phone Number (for completion notification)",
            },
            type: "text",
            optional: false,
          },
        ],
      }),
    });

    return paymentLink;
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
}

// Retrieve payment session details
export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "payment_intent"],
    });
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw error;
  }
}

// Create a simple checkout session (alternative to payment link)
export async function createCheckoutSession(
  jobToken: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  if (!PRICE_ID) {
    throw new Error("Stripe price ID not configured");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        job_token: jobToken,
      },
      // Collect phone number during checkout
      custom_fields: [
        {
          key: "phone_number",
          label: {
            type: "custom",
            custom: "Phone Number",
          },
          type: "text",
          optional: false,
        },
      ],
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Webhook handler for Stripe events
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    throw error;
  }
}

// Helper to extract phone number from checkout session
export function extractPhoneNumber(
  session: Stripe.Checkout.Session
): string | null {
  // Check custom fields first
  if (session.custom_fields) {
    const phoneField = session.custom_fields.find(
      (field) => field.key === "phone_number"
    );
    if (phoneField?.text?.value) {
      return phoneField.text.value;
    }
  }

  // Check customer phone
  if (
    session.customer &&
    typeof session.customer === "object" &&
    "phone" in session.customer
  ) {
    return session.customer.phone || null;
  }

  return null;
}

// Initialize Stripe product and price (run once during setup)
export async function initializeStripeProduct(): Promise<{
  product: Stripe.Product;
  price: Stripe.Price;
}> {
  try {
    // Create or update product
    let product: Stripe.Product;

    if (PRODUCT_ID) {
      product = await stripe.products.retrieve(PRODUCT_ID);
    } else {
      product = await stripe.products.create({
        name: "Custom Sleep Story",
        description:
          "A personalized bedtime story with custom characters, settings, and values",
        metadata: {
          category: "digital_content",
        },
      });
      console.log("Created Stripe product:", product.id);
    }

    // Create price if not exists
    let price: Stripe.Price;

    if (PRICE_ID) {
      price = await stripe.prices.retrieve(PRICE_ID);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 200, // $2.00 in cents
        currency: "usd",
        metadata: {
          display_name: "Custom Sleep Story",
        },
      });
      console.log("Created Stripe price:", price.id);
    }

    return { product, price };
  } catch (error) {
    console.error("Error initializing Stripe product:", error);
    throw error;
  }
}
