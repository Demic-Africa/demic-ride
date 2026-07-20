#!/bin/bash
# Test booking API with curl

curl -X POST http://localhost:3003/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "pickup": "Nairobi CBD",
    "destination": "Jomo Kenyatta International Airport",
    "phone": "+254700000000",
    "email": "test@example.com",
    "scheduledTime": "2026-07-21T10:00:00",
    "notes": "Test booking with all features",
    "amount": 1500,
    "language": "sw"
  }'
