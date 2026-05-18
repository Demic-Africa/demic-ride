import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { bookingId, pickupLat, pickupLng } = await request.json();
    
    // 1. Fetch all available drivers
    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available');
    
    if (driverError || !drivers?.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'No available drivers' 
      }, { status: 404 });
    }
    
    // 2. Pick nearest driver if coordinates exist, otherwise random
    let assignedDriver;
    let dispatchMethod;
    
    if (pickupLat && pickupLng && drivers.some((d: any) => d.current_lat && d.current_lng)) {
      assignedDriver = findNearestDriver(pickupLat, pickupLng, drivers);
      dispatchMethod = 'gps';
    } else {
      assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];
      dispatchMethod = 'random';
    }
    
    // 3. Update booking with assigned driver
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        driver_id: assignedDriver.id, 
        dispatch_method: dispatchMethod,
        status: 'dispatched',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
    
    if (updateError) throw updateError;
    
    // 4. Update driver status
    await supabase
      .from('drivers')
      .update({ status: 'busy' })
      .eq('id', assignedDriver.id);
    
    // 5. Log the status change
    await supabase
      .from('status_logs')
      .insert({
        booking_id: bookingId,
        status: 'dispatched'
      });
    
    return NextResponse.json({
      success: true,
      driver: assignedDriver,
      method: dispatchMethod
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

function findNearestDriver(pickupLat: number, pickupLng: number, drivers: any[]) {
  return drivers
    .filter((d: any) => d.current_lat && d.current_lng)
    .map((d: any) => ({
      ...d,
      distance: Math.sqrt(
        Math.pow(d.current_lat - pickupLat, 2) + 
        Math.pow(d.current_lng - pickupLng, 2)
      )
    }))
    .sort((a: any, b: any) => a.distance - b.distance)[0];
}
