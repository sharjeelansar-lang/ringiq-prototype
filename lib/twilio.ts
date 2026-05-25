import twilio from 'twilio';

// API Key client — used for sub-account creation
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey    = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  if (!accountSid) throw new Error('TWILIO_ACCOUNT_SID not set in .env');
  if (!apiKey || !apiSecret) throw new Error('TWILIO_API_KEY / TWILIO_API_SECRET not set in .env');

  return twilio(apiKey, apiSecret, { accountSid });
}

// Main Auth Token client — required for availablePhoneNumbers and number purchase
export function getTwilioMainClient() {
  const accountSid  = process.env.TWILIO_PROD_ACCOUNT_SID;
  const authToken   = process.env.TWILIO_PROD_AUTH_TOKEN;

  if (!accountSid) throw new Error('TWILIO_PROD_ACCOUNT_SID not set in .env');
  if (!authToken)  throw new Error('TWILIO_PROD_AUTH_TOKEN not set in .env');

  return twilio(accountSid, authToken);
}

// Sub-account client — used after a sub-account is created
export function getTwilioSubClient(subSid: string, subToken: string) {
  return twilio(subSid, subToken);
}
