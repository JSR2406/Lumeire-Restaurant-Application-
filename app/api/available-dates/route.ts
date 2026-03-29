import { NextResponse } from "next/server"
import { getAvailableDatesWithRecords } from "@/lib/teable"

export async function GET() {
  try {
    const rawDates = await getAvailableDatesWithRecords()

    console.log("[v0] Raw dates from Teable:", JSON.stringify(rawDates, null, 2))

    const dates = rawDates.map((item) => {
      const dateStr = item.date
      let formattedDate = dateStr

      // Try to format the date nicely
      if (dateStr) {
        try {
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }
        } catch {
          // Keep original string if parsing fails
        }
      }

      return {
        date: dateStr,
        recordId: item.recordId,
        formattedDate,
      }
    })

    console.log("[v0] Transformed dates:", JSON.stringify(dates, null, 2))

    return NextResponse.json({ dates })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error fetching available dates:", errorMessage)
    return NextResponse.json({ dates: [], error: errorMessage })
  }
}
