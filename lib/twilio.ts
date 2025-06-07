import twilio from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromPhoneNumber) {
  console.warn(
    "Twilio credentials not configured. SMS functionality will be disabled."
  );
}

const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

// Format phone number to E.164 format if needed
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // If it starts with 1 (US/Canada), ensure it has +1
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    return `+${cleaned}`;
  }

  // If it's 10 digits (US without country code), add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it already starts with +, return as is
  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  // Otherwise, assume it needs a + prefix
  return `+${cleaned}`;
}

// Send SMS notification
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!twilioClient) {
    console.error("Twilio client not initialized");
    return { success: false, error: "SMS service not configured" };
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    const result = await twilioClient.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: formattedNumber,
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

// Pre-built message templates
export const SMS_TEMPLATES = {
  generationComplete: (downloadUrl: string) =>
    `Your custom sleep story is ready! 🌙 Download your audio, artwork, and story at: ${downloadUrl}`,

  generationFailed: () =>
    `We encountered an issue generating your sleep story. Please contact our support at ${process.env.CUSTOMER_SERVICE_PHONE} for assistance and a refund.`,

  paymentConfirmation: () =>
    `Thank you for your purchase! We're now creating your custom sleep story. This typically takes about 3 minutes. We'll text you when it's ready! 🎨`,
} as const;

// Send completion notification
export async function sendCompletionNotification(
  phoneNumber: string,
  jobToken: string
): Promise<{ success: boolean; error?: string }> {
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/download/${jobToken}`;
  const message = SMS_TEMPLATES.generationComplete(downloadUrl);

  return sendSMS(phoneNumber, message);
}

// Send failure notification with customer service contact
export async function sendFailureNotification(
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  const message = SMS_TEMPLATES.generationFailed();
  return sendSMS(phoneNumber, message);
}

// Validate phone number (basic validation)
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove all non-numeric characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Check if it's a valid length (10-15 digits)
  const digitsOnly = cleaned.replace(/\+/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}
