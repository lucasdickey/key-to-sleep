# Infrastructure Setup Guide

This guide walks you through setting up all the required services for the Key To Sleep platform.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed and configured

## 1. Clone and Install

```bash
git clone <repository-url>
cd sleep-story-generator
npm install
```

## 2. Environment Configuration

1. Copy the environment template:

   ```bash
   cp env.example .env.local
   ```

2. Fill in the values as you set up each service below.

## 3. Service Setup

### 3.1 Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Once created, go to Settings > API
4. Copy the following values to your `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon/Public key
   - `SUPABASE_SERVICE_ROLE_KEY` = Service Role key (keep this secret!)

5. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the query

### 3.2 AWS S3 Setup

1. Create an AWS account at https://aws.amazon.com
2. Go to S3 service and create a new bucket:

   - Bucket name: `key-to-sleep-assets` (or your preferred name)
   - Region: `us-east-1` (or your preferred region)
   - Uncheck "Block all public access" (we need public read for assets)
   - Create bucket

3. Configure bucket policy for public read:

   - Go to bucket > Permissions > Bucket Policy
   - Add this policy (replace `YOUR-BUCKET-NAME`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

4. Create IAM user for programmatic access:

   - Go to IAM > Users > Create User
   - User name: `key-to-sleep-s3-user`
   - Select "Access key - Programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or create a more restrictive policy)
   - Save the Access Key ID and Secret Access Key

5. Update `.env.local`:
   - `AWS_ACCESS_KEY_ID` = Your Access Key ID
   - `AWS_SECRET_ACCESS_KEY` = Your Secret Access Key
   - `AWS_REGION` = Your chosen region (e.g., `us-east-1`)
   - `AWS_S3_BUCKET_NAME` = Your bucket name

### 3.3 Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from Dashboard > Developers > API keys
3. Update `.env.local`:

   - `STRIPE_SECRET_KEY` = Secret key (use test key for development)
   - `STRIPE_PUBLISHABLE_KEY` = Publishable key

4. Run the Stripe setup script:
   ```bash
   npx ts-node scripts/setup-stripe.ts
   ```
5. Copy the generated Product ID and Price ID to `.env.local`:

   - `STRIPE_PRODUCT_ID` = Generated product ID
   - `STRIPE_PRICE_ID` = Generated price ID

6. Set up webhook (for production):
   - Go to Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3.4 Twilio Setup

1. Create a Twilio account at https://www.twilio.com
2. Get a phone number with SMS capabilities
3. Find your credentials in Console Dashboard
4. Update `.env.local`:
   - `TWILIO_ACCOUNT_SID` = Account SID
   - `TWILIO_AUTH_TOKEN` = Auth Token
   - `TWILIO_PHONE_NUMBER` = Your Twilio phone number (with country code)

### 3.5 OpenAI Setup

1. Create an OpenAI account at https://platform.openai.com
2. Generate an API key from API keys section
3. Update `.env.local`:
   - `OPENAI_API_KEY` = Your API key

### 3.6 ElevenLabs Setup

1. Create an ElevenLabs account at https://elevenlabs.io
2. Get your API key from Profile Settings
3. Choose or create a voice and get its Voice ID
4. Update `.env.local`:
   - `ELEVENLABS_API_KEY` = Your API key
   - `ELEVENLABS_VOICE_ID` = Your chosen voice ID

## 4. Testing Your Setup

### 4.1 Test Database Connection

```bash
npx ts-node -e "
import { supabase } from './lib/supabase';
supabase.from('jobs').select('count').then(console.log).catch(console.error);
"
```

### 4.2 Test S3 Connection

```bash
npx ts-node -e "
import { uploadTextToS3 } from './lib/s3';
uploadTextToS3('test-token', 'story', 'Test content').then(console.log).catch(console.error);
"
```

### 4.3 Test Stripe Connection

The setup script already tests this, but you can verify:

```bash
npx ts-node -e "
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
stripe.products.list({ limit: 1 }).then(console.log).catch(console.error);
"
```

### 4.4 Test Twilio (Optional)

⚠️ This will send a real SMS and incur charges:

```bash
npx ts-node -e "
import { sendSMS } from './lib/twilio';
sendSMS('+1234567890', 'Test message from Key To Sleep').then(console.log).catch(console.error);
"
```

## 5. Common Issues

### Issue: Supabase connection errors

- Ensure all three Supabase keys are correctly copied
- Check that the database schema was applied successfully

### Issue: S3 upload fails

- Verify IAM user has proper permissions
- Check bucket name and region match your configuration
- Ensure bucket policy allows public read

### Issue: Stripe API errors

- Make sure you're using the correct test/live keys
- Verify the product and price were created successfully

### Issue: Twilio SMS not sending

- Verify phone number format includes country code
- Check Twilio account has SMS credits
- Ensure phone number is verified for SMS

## 6. Next Steps

Once all services are configured:

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000 to see the app

3. Continue with Phase 2 of the implementation plan

## Security Reminders

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Regularly rotate API keys and credentials
- Set up proper access controls in production
