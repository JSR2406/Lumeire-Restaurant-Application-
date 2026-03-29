import { NextResponse } from "next/server"
import { getFeaturedDishes, isTeableConfigured, getConfigError } from "@/lib/teable"

export async function GET() {
  if (!isTeableConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: getConfigError(),
        dishes: [],
      },
      { status: 500 },
    )
  }

  try {
    const dishes = await getFeaturedDishes()
    return NextResponse.json({ success: true, dishes })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[API] Error fetching featured dishes:", errorMessage)
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
