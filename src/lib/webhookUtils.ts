import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || '';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!signature || !timestamp || !WEBHOOK_SECRET) {
      console.error('Missing required webhook verification parameters');
      return false;
    }

    // Extract version and signature
    const [version, receivedSignature] = signature.split(',');
    if (version !== 'v1') {
      console.error('Unsupported signature version');
      return false;
    }

    // Create the signature
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(timestamp + payload);
    const expectedSignature = hmac.digest('base64');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
} 