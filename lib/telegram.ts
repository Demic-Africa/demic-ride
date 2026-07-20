// lib/telegram.ts
export async function sendTelegramAlert(booking: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials missing');
    return;
  }

  const message = `
🚖 *NEW BOOKING ALERT*
━━━━━━━━━━━━━━━━━
👤 *Customer:* ${booking.customer_name || booking.customerName || 'N/A'}
📍 *From:* ${booking.pickup_location || booking.pickupLocation || 'N/A'}
🎯 *To:* ${booking.destination || 'N/A'}
⏰ *Time:* ${booking.scheduled_time || booking.scheduledTime || 'Now'}
📱 *Contact:* ${booking.phone || 'N/A'}
💵 *Amount:* KES ${booking.amount || '0'}
📝 *Notes:* ${booking.notes || 'None'}
━━━━━━━━━━━━━━━━━
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    } else {
      console.log('✅ Telegram alert sent successfully');
    }
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
}
