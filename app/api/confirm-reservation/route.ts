import { type NextRequest, NextResponse } from "next/server"
import { getReservation, confirmReservation } from "@/lib/teable"

const TEABLE_API_URL = process.env.TEABLE_API_URL
const TEABLE_APP_TOKEN = process.env.TEABLE_APP_TOKEN
const RESERVATIONS_TABLE_ID = "tblfOWkk8sc3WmFLzvv"

// GET - Fetch reservation details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 })
    }

    const reservation = await getReservation(id)

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({ reservation })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[API] Error fetching reservation:", errorMessage)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}

// POST - Confirm reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 })
    }

    const result = await confirmReservation(id)

    return NextResponse.json({ success: true, reservation: result })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[API] Error confirming reservation:", errorMessage)
    return NextResponse.json({ error: "Failed to confirm reservation" }, { status: 500 })
  }
}
