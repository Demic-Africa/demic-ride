import IntaSend from 'intasend-node';

const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY!,
  process.env.INTASEND_SECRET_KEY!,
  false
);

export async function initiateMpesaPayment(params: {
  bookingId: string
  amount: number
  phone: string
  passengerName: string
}) {
  try {
    const response = await intasend.collection().mpesaStkPush({
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
    const response = await intasend.collection().status(invoiceId);
    return { success: true, status: response.invoice?.state };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
