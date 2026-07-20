import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '@/lib/telegram'
import { translateBookingDetails } from '@/lib/translate'
import { sendMultiChannelNotification } from '@/lib/notifications'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      bookings,
      count: bookings?.length || 0
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    console.log('📥 Received booking:', bookingData)

    // Validate required fields (using your table's column names)
    if (!bookingData.customerName || !bookingData.pickup || !bookingData.destination || !bookingData.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, pickup, destination, phone' },
        { status: 400 }
      )
    }

    // Map to your existing table structure
    const bookingToInsert = {
      passenger_name: bookingData.customerName,
      passenger_phone: bookingData.phone,
      pickup_address: bookingData.pickup,
      destination_address: bookingData.destination,
      status: 'pending',
      notes: bookingData.notes || null,
      scheduled_date: bookingData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduled_time: bookingData.scheduledTime || new Date().toTimeString().split(' ')[0].slice(0, 5),
      // Optional fields if they exist
      ...(bookingData.email && { email: bookingData.email }),
      ...(bookingData.amount && { amount: bookingData.amount }),
      ...(bookingData.language && { language_preference: bookingData.language })
    }

    // Save to Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([bookingToInsert])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    console.log('✅ Booking created:', booking.id)

    // 1. Send Telegram Alert (using consistent field names)
    const telegramBooking = {
      id: booking.id,
      customer_name: booking.passenger_name,
      pickup_location: booking.pickup_address,
      destination: booking.destination_address,
      phone: booking.passenger_phone,
      amount: bookingData.amount || 0,
      notes: booking.notes || 'None',
      scheduledTime: booking.scheduled_time ? `${booking.scheduled_date} ${booking.scheduled_time}` : 'Now'
    }

    try {
      await sendTelegramAlert(telegramBooking)
      console.log('✅ Telegram alert sent')
    } catch (telegramError) {
      console.error('❌ Telegram failed:', telegramError)
    }

    // 2. Translate if needed
    const targetLanguage = bookingData.language || 'en'
    let translatedBooking = booking
    try {
      if (targetLanguage !== 'en') {
        // Map to translate format
        const translateData = {
          customerName: booking.passenger_name,
          pickup: booking.pickup_address,
          destination: booking.destination_address,
          notes: booking.notes || ''
        }
        const translated = await translateBookingDetails(translateData, targetLanguage)
        translatedBooking = {
          ...booking,
          passenger_name: translated.customerName || booking.passenger_name,
          pickup_address: translated.pickup || booking.pickup_address,
          destination_address: translated.destination || booking.destination_address,
          notes: translated.notes || booking.notes
        }
        console.log(`✅ Translated to ${targetLanguage}`)
      }
    } catch (translateError) {
      console.error('❌ Translation failed:', translateError)
    }

    // 3. Send notifications
    try {
      await sendMultiChannelNotification(telegramBooking, targetLanguage)
      console.log('✅ Notifications sent')
    } catch (notificationError) {
      console.error('❌ Notifications failed:', notificationError)
    }

    return NextResponse.json({
      success: true,
      booking: translatedBooking,
      message: targetLanguage !== 'en' 
        ? `Booking confirmed! Check your ${targetLanguage} confirmation.` 
        : 'Booking confirmed! Check your confirmation.',
      bookingId: booking.id
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
