import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);

export async function initiateMpesaPayment(params: {
  bookingId: string
  amount: number
  phone: string
  passengerName: string
}) {
  try {
    const response = await flw.MobileMoney.charge({
      tx_ref: `ride-${params.bookingId}-${Date.now()}`,
      amount: params.amount,
      currency: 'KES',
      phone_number: params.phone,
      fullname: params.passengerName,
      network: 'MPESA',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${params.bookingId}/confirm`
    });
    
    return { success: true, transactionId: response.data?.id, status: response.data?.status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(transactionId: string) {
  try {
    const response = await flw.Transaction.verify({ id: transactionId });
    return { success: true, status: response.data?.status, amount: response.data?.amount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
