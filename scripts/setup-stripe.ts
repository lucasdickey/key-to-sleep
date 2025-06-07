#!/usr/bin/env node
import { config } from "dotenv";
import { initializeStripeProduct } from "../lib/stripe";

// Load environment variables
config({ path: ".env.local" });

async function setupStripe() {
  console.log("🚀 Setting up Stripe products and prices...\n");

  try {
    const { product, price } = await initializeStripeProduct();

    console.log("✅ Stripe setup complete!\n");
    console.log("Product Details:");
    console.log(`  ID: ${product.id}`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Description: ${product.description}\n`);

    console.log("Price Details:");
    console.log(`  ID: ${price.id}`);
    console.log(
      `  Amount: $${(price.unit_amount! / 100).toFixed(
        2
      )} ${price.currency?.toUpperCase()}`
    );
    console.log(`  Product: ${price.product}\n`);

    console.log("⚠️  Please add these values to your .env.local file:");
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);
    console.log(`STRIPE_PRICE_ID=${price.id}\n`);
  } catch (error) {
    console.error("❌ Error setting up Stripe:", error);
    process.exit(1);
  }
}

// Run the setup
setupStripe();
