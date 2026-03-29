import { NextResponse } from "next/server"
import { getEvents } from "@/lib/teable"

export async function GET() {
  try {
    const events = await getEvents()
    return NextResponse.json({ success: true, events, total: events.length })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error fetching events:", errorMessage)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        events: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
