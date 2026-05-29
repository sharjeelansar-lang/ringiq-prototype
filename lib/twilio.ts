import twilio from 'twilio';

// Auth Token client — must use AccountSID + AuthToken (NOT API Key) for sub-account creation
// because Twilio SDK v6 returns null for authToken on AccountInstance when authenticated via API Key.
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid) throw new Error('TWILIO_ACCOUNT_SID not set in .env');
  if (!authToken)  throw new Error('TWILIO_AUTH_TOKEN not set in .env');

  return twilio(accountSid, authToken);
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
