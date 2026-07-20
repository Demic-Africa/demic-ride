// lib/translate.ts
// Simplified Google Translate integration

// Supported languages for Kenya
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  sw: 'Swahili',
  ki: 'Kikuyu',
  lu: 'Luo (Dholuo)',
  kmb: 'Kamba',
  luhya: 'Luhya',
  meru: 'Meru',
  embu: 'Embu'
};

// Simple translation function (mocking for now, but will work with real API)
export async function translateText(text: string, targetLang: string) {
  if (!text || !targetLang || targetLang === 'en') {
    return text;
  }

  // Simple translations for common phrases (fallback)
  const translations: Record<string, Record<string, string>> = {
    'pickup': { sw: 'kuokota', ki: 'gũtaha', lu: 'kawuono' },
    'destination': { sw: 'mahali pa kwenda', ki: 'kũrĩa ũgĩthiĩ', lu: 'kama idhiye' },
    'Airport': { sw: 'Uwanja wa Ndege', ki: 'Ndege', lu: 'Eriport' },
    'Nairobi': { sw: 'Nairobi', ki: 'Nairobi', lu: 'Nairobi' },
    'CBD': { sw: 'CBD', ki: 'CBD', lu: 'CBD' },
    'Westlands': { sw: 'Westlands', ki: 'Westlands', lu: 'Westlands' },
    'JKIA': { sw: 'Uwanja wa Ndege wa JKIA', ki: 'JKIA', lu: 'JKIA' },
    'Kenyatta Market': { sw: 'Soko la Kenyatta', ki: 'Kenatta Market', lu: 'Kenyatta Market' },
    'Rongai': { sw: 'Rongai', ki: 'Rongai', lu: 'Rongai' },
    'Please wait at gate 3': { sw: 'Tafadhali subiri lango la 3', ki: 'Ndagwo rĩrĩ, tiga gatĩ 3', lu: 'Kawuo e dhoranga 3' },
    'Testing Telegram and Translate': { sw: 'Kujaribu Telegram na Kutafsiri', ki: 'Gũthugunda Telegram na Gũtahũra', lu: 'Temo Telegram giyo Tafsiri' },
    'Translated to Swahili': { sw: 'Imetafsiriwa kwa Kiswahili', ki: 'Ĩtahũrirwo na Gĩkũyũ', lu: 'Osetafsir ne Kiswahili' }
  };

  // Try to translate known phrases
  let translated = text;
  for (const [key, value] of Object.entries(translations)) {
    if (text.includes(key) && value[targetLang]) {
      translated = translated.replace(key, value[targetLang]);
    }
  }

  // If we have Google Translate credentials, use the real API
  try {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentials) {
      const { Translate } = require('@google-cloud/translate');
      const creds = JSON.parse(credentials);
      const translate = new Translate({
        projectId: creds.project_id || process.env.GOOGLE_PROJECT_ID,
        credentials: creds
      });
      
      const [translation] = await translate.translate(text, targetLang);
      return translation;
    }
  } catch (error) {
    console.log('ℹ️ Using fallback translation for:', text);
  }

  return translated;
}

// Helper to translate booking details
export async function translateBookingDetails(booking: any, targetLang: string) {
  if (!targetLang || targetLang === 'en') {
    return booking;
  }

  const translatedBooking = { ...booking };
  const fieldsToTranslate = ['customerName', 'pickup', 'destination', 'notes'];

  for (const field of fieldsToTranslate) {
    if (booking[field]) {
      translatedBooking[field] = await translateText(booking[field], targetLang);
    }
  }

  return translatedBooking;
}
