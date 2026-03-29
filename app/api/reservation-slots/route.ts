import { type NextRequest, NextResponse } from "next/server"
import { getTimeSlotsForDate } from "@/lib/teable"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ slots: [], recordId: null, error: "Date is required" })
    }

    const result = await getTimeSlotsForDate(date)

    console.log("[v0] Raw time slots result:", JSON.stringify(result, null, 2))

    const transformedSlots = (result.slots || []).map((time, index) => ({
      id: `slot-${index}`,
      time: time,
    }))

    console.log("[v0] Transformed slots:", JSON.stringify(transformedSlots, null, 2))

    return NextResponse.json({
      slots: transformedSlots,
      recordId: result.recordId,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error in reservation slots API:", errorMessage)
    return NextResponse.json({
      slots: [],
      recordId: null,
      error: errorMessage,
    })
  }
}
