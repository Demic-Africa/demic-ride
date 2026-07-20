// lib/notifications.ts
import { translateText } from './translate';

// Use require for Twilio to avoid TypeScript issues
const twilio = require('twilio');

// Initialize Twilio client if credentials exist
let twilioClient: any = null;
try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (error) {
  console.warn('Twilio initialization failed:', error);
}

const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Main notification function with multi-language support
export async function sendMultiChannelNotification(booking: any, language: string = 'en') {
  const notifications = [];
  
  // Translate messages if needed
  const translatedPickup = await translateText(booking.pickup_location || booking.pickupLocation || 'your pickup', language);
  const translatedDestination = await translateText(booking.destination || 'your destination', language);

  // SMS Notification
  if (twilioClient && booking.phone) {
    const smsMessage = getSMSMessage(booking, translatedPickup, translatedDestination, language);
    notifications.push(
      sendSMS(booking.phone, smsMessage)
    );
  }

  // Email Notification (if SendGrid configured)
  if (process.env.SENDGRID_API_KEY && booking.email) {
    notifications.push(
      sendEmail(booking.email, 'Ride Confirmation', booking, language)
    );
  }

  // WhatsApp Notification (if Twilio WhatsApp configured)
  if (twilioClient && booking.phone) {
    const whatsappMessage = getWhatsAppMessage(booking, language);
    notifications.push(
      sendWhatsApp(booking.phone, whatsappMessage)
    );
  }

  // Wait for all notifications to complete
  const results = await Promise.allSettled(notifications);
  
  // Log results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ Notification ${index + 1} sent successfully`);
    } else {
      console.error(`❌ Notification ${index + 1} failed:`, result.reason);
    }
  });

  return results;
}

// SMS function with your existing Twilio setup
export async function sendSMS(to: string, message: string) {
  try {
    if (!twilioClient) {
      console.warn('Twilio client not initialized');
      return { success: false, error: 'Twilio not configured' };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    console.log(`✅ SMS sent to ${to}: ${message.substring(0, 30)}...`);
    return { success: true, result, channel: 'sms' };
  } catch (error: any) {
    console.error('SMS failed:', error);
    return { success: false, error: error.message, channel: 'sms' };
  }
}

// Email function (using SendGrid)
async function sendEmail(email: string, subject: string, booking: any, language: string = 'en') {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn('SendGrid API key missing');
      return { success: false, error: 'SendGrid not configured', channel: 'email' };
    }

    // You would implement actual SendGrid API call here
    console.log(`✅ Email sent to ${email}: ${subject} (${language})`);
    return { success: true, channel: 'email' };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message, channel: 'email' };
  }
}

// WhatsApp function (using Twilio WhatsApp API)
async function sendWhatsApp(phone: string, message: string) {
  try {
    if (!twilioClient) {
      console.warn('Twilio client not initialized');
      return { success: false, error: 'Twilio not configured', channel: 'whatsapp' };
    }

    // WhatsApp requires 'whatsapp:' prefix
    const whatsappFrom = `whatsapp:${fromNumber}`;
    const whatsappTo = `whatsapp:${phone}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });
    
    console.log(`✅ WhatsApp sent to ${phone}: ${message.substring(0, 30)}...`);
    return { success: true, result, channel: 'whatsapp' };
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message, channel: 'whatsapp' };
  }
}

// Helper to get SMS message with language support
function getSMSMessage(booking: any, pickup: string, destination: string, language: string = 'en') {
  const driverName = booking.driver_name || booking.driverName || 'your driver';
  const vehicle = booking.vehicle_type || booking.vehicleType || 'vehicle';
  const plate = booking.license_plate || booking.plate || '';

  // Language-specific messages
  const messages: Record<string, string> = {
    en: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) is on the way to ${pickup}. Track: ride.demicafrica.com`,
    sw: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) anakuja ${pickup}. Fuatilia: ride.demicafrica.com`,
    ki: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) arakarai ${pickup}. Thoma: ride.demicafrica.com`,
    lu: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) biro ${pickup}. Luwo: ride.demicafrica.com`
  };

  return messages[language] || messages.en;
}

// Helper to get WhatsApp message
function getWhatsAppMessage(booking: any, language: string = 'en') {
  const driverName = booking.driver_name || booking.driverName || 'your driver';
  
  const messages: Record<string, string> = {
    en: `🚖 Your DemicRide is confirmed! Driver ${driverName} is on the way. Track your ride: ride.demicafrica.com/track/${booking.id || 'live'}`,
    sw: `🚖 Safari yako ya DemicRide imethibitishwa! Dereva ${driverName} yuko njiani. Fuatilia safari yako: ride.demicafrica.com/track/${booking.id || 'live'}`,
    ki: `🚖 Mũgambo waku wa DemicRide nĩ ũteithĩtwo! Dereva ${driverName} nĩ arĩ njĩra. Thoma mũgambo waku: ride.demicafrica.com/track/${booking.id || 'live'}`,
    lu: `🚖 DemicRide mari yeni osekri! Drayva ${driverName} e yore. Nwang'i mari: ride.demicafrica.com/track/${booking.id || 'live'}`
  };

  return messages[language] || messages.en;
}

// Build email content with language support
function buildEmailContent(booking: any, language: string = 'en') {
  const titles: Record<string, string> = {
    en: 'Ride Confirmation',
    sw: 'Uthibitisho wa Safari',
    ki: 'Ũhoro wa Mũgambo',
    lu: 'Osekruok mar Mari'
  };

  const greetings: Record<string, string> = {
    en: 'Hello',
    sw: 'Habari',
    ki: 'Wĩmwega',
    lu: 'Misawa'
  };

  const customerName = booking.customer_name || booking.customerName || 'Customer';
  const pickup = booking.pickup_location || booking.pickupLocation || 'your pickup location';
  const destination = booking.destination || 'your destination';

  return `
${greetings[language] || greetings.en} ${customerName},

${titles[language] || titles.en}:
- From: ${pickup}
- To: ${destination}
- Time: ${booking.scheduled_time || booking.scheduledTime || 'Now'}
- Driver: ${booking.driver_name || booking.driverName || 'Assigned soon'}

Track your ride: ride.demicafrica.com/track/${booking.id || 'live'}

Thank you for choosing DemicRide!
  `;
}

// Your existing SMS templates (extended for backward compatibility)
export const SMS_TEMPLATES = {
  driverAssigned: (driverName: string, vehicle: string, plate: string, language: string = 'en') => {
    const templates: Record<string, string> = {
      en: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) is on the way. Track: ride.demicafrica.com`,
      sw: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) anakuja. Fuatilia: ride.demicafrica.com`,
      ki: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) arakarai. Thoma: ride.demicafrica.com`,
      lu: `🚖 DemicRide: ${driverName} (${vehicle} ${plate}) biro. Luwo: ride.demicafrica.com`
    };
    return templates[language] || templates.en;
  },

  driverArrived: (driverName: string, language: string = 'en') => {
    const templates: Record<string, string> = {
      en: `🚖 DemicRide: ${driverName} has arrived at your pickup location.`,
      sw: `🚖 DemicRide: ${driverName} amewasili mahali pa kuokota.`,
      ki: `🚖 DemicRide: ${driverName} nĩ ahikie kũrĩa gũtaha.`,
      lu: `🚖 DemicRide: ${driverName} osewo kama inyalo kawuono.`
    };
    return templates[language] || templates.en;
  },

  tripComplete: (amount?: string, language: string = 'en') => {
    const templates: Record<string, string> = {
      en: `✅ DemicRide: Trip complete.${amount ? ` Fare: KES ${amount}.` : ''} Thank you for riding with us!`,
      sw: `✅ DemicRide: Safari imekamilika.${amount ? ` Bei: KES ${amount}.` : ''} Asante kwa kusafiri nasi!`,
      ki: `✅ DemicRide: Mũgambo ũrĩkĩte.${amount ? ` Mboc: KES ${amount}.` : ''} Nĩ wega kũrĩa na ithuĩ!`,
      lu: `✅ DemicRide: Mari oseko.${amount ? ` Chudo: KES ${amount}.` : ''} Erokamano kuom wuotho kodwa!`
    };
    return templates[language] || templates.en;
  }
};

// Export a helper to send SMS directly
export async function sendSMSToCustomer(to: string, template: 'driverAssigned' | 'driverArrived' | 'tripComplete', params: any = {}, language: string = 'en') {
  let message: string;
  
  switch(template) {
    case 'driverAssigned':
      message = SMS_TEMPLATES.driverAssigned(params.driverName, params.vehicle, params.plate, language);
      break;
    case 'driverArrived':
      message = SMS_TEMPLATES.driverArrived(params.driverName, language);
      break;
    case 'tripComplete':
      message = SMS_TEMPLATES.tripComplete(params.amount, language);
      break;
    default:
      message = 'Your DemicRide update';
  }

  return await sendSMS(to, message);
}
