import { type NextRequest, NextResponse } from "next/server"
import { createReservation, isTeableConfigured, getConfigError } from "@/lib/teable"

export async function POST(request: NextRequest) {
  if (!isTeableConfigured()) {
    return NextResponse.json({ error: getConfigError() }, { status: 500 })
  }

  try {
    const body = await request.json()

    const { customerName, email, phone, numberOfGuests, specialRequests, date, timeSlot, slotRecordId } = body

    if (!customerName || !email || !phone || !numberOfGuests || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const reservation = await createReservation({
      customerName,
      email,
      phone,
      numberOfGuests,
      specialRequests,
      date,
      timeSlot,
      slotRecordId,
    })

    return NextResponse.json({
      reservation,
      reservationId: reservation.reservationId,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[API] Error creating reservation:", errorMessage)
    return NextResponse.json({ error: errorMessage || "Failed to create reservation" }, { status: 500 })
  }
}
