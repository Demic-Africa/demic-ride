import IntaSend from 'intasend-node';

// --- integration status (logged once at server boot) ---
if (typeof window === 'undefined') {
  if (!process.env.INTASEND_PUBLISHABLE_KEY || !process.env.INTASEND_SECRET_KEY) {
    console.warn('[payment] IntaSend not configured — M-Pesa payments disabled')
  }
}

let _intasend: IntaSend | null = null;
function getIntaSend(): IntaSend {
  if (_intasend) return _intasend;
  const pub = process.env.INTASEND_PUBLISHABLE_KEY;
  const secret = process.env.INTASEND_SECRET_KEY;
  if (!pub || !secret) {
    throw new Error('[payment] IntaSend credentials missing — cannot charge')
  }
  _intasend = new IntaSend(pub, secret, false);
  return _intasend;
}

export async function initiateMpesaPayment(params: {
  bookingId: string
  amount: number
  phone: string
  passengerName: string
}) {
  try {
    const response = await getIntaSend().collection().mpesaStkPush({
      first_name: params.passengerName.split(' ')[0],
      last_name: params.passengerName.split(' ').slice(1).join(' ') || 'Customer',
      email: `${params.phone}@demicafrica.com`,
      phone_number: params.phone,
      amount: params.amount,
      currency: 'KES',
      api_ref: `ride-${params.bookingId}`
    });
    return { success: true, invoiceId: response.invoice?.id, status: 'pending' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkPaymentStatus(invoiceId: string) {
  try {
    const response = await getIntaSend().collection().status(invoiceId);
    return { success: true, status: response.invoice?.state };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
