import { NextResponse } from 'next/server';
import { initiateMpesaPayment, checkPaymentStatus } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    if (action === 'charge') {
      const result = await initiateMpesaPayment(params);
      return NextResponse.json(result);
    }

    if (action === 'status') {
      const result = await checkPaymentStatus(params.invoiceId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
