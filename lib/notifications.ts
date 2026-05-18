import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('SMS failed:', error);
    return { success: false, error: error.message };
  }
}

// Pre-built message templates
export const SMS_TEMPLATES = {
  driverAssigned: (driverName: string, vehicle: string, plate: string) =>
    `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) is on the way. Track: ride.demicafrica.com`,
  
  driverArrived: (driverName: string) =>
    `🚖 DemicRide: ${driverName} has arrived at your pickup location.`,
  
  tripComplete: (amount?: string) =>
    `✅ DemicRide: Trip complete.${amount ? ` Fare: KES ${amount}.` : ''} Thank you for riding with us!`
};
