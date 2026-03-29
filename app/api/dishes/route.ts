import { NextResponse } from "next/server"
import { getDishes } from "@/lib/teable"

export async function GET() {
  try {
    const dishes = await getDishes()
    return NextResponse.json({ success: true, dishes })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error fetching dishes:", errorMessage)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        dishes: [],
      },
      { status: 500 },
    )
  }
}
