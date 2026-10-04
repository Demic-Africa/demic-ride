import { Resend } from 'resend'

// --- integration status (logged once at server boot) ---
if (typeof window === 'undefined') {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[receipt] Resend not configured — email receipts disabled')
  }
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('[receipt] RESEND_API_KEY missing — cannot send')
  _resend = new Resend(key);
  return _resend;
}

export async function sendReceipt(params: {
  email: string
  passengerName: string
  pickup: string
  destination: string
  driverName: string
  vehicle: string
  amount: number
  date: string
}) {
  try {
    await getResend().emails.send({
      from: 'Demic Ride <receipts@ride.demicafrica.com>',
      to: params.email,
      subject: `Your Demic Ride Receipt — ${params.date}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #FFD700;">DEMIC RIDE</h2>
          <h3>Trip Receipt</h3>
          <p><strong>Passenger:</strong> ${params.passengerName}</p>
          <p><strong>Date:</strong> ${params.date}</p>
          <hr />
          <p><strong>Pickup:</strong> ${params.pickup}</p>
          <p><strong>Destination:</strong> ${params.destination}</p>
          <p><strong>Driver:</strong> ${params.driverName} — ${params.vehicle}</p>
          <hr />
          <h3 style="color: #FFD700;">Total: KES ${params.amount}</h3>
          <p style="color: #666; font-size: 0.875rem;">Thank you for riding with Demic!</p>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}
