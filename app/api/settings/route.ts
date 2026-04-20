import { getSetting } from "@/lib/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const setting = await getSetting();

    return NextResponse.json({
      maintenanceMode: setting?.maintenanceMode ?? false,
    });
  } catch (error) {
    console.error("Settings API error:", error);

    // Fail-safe: always return JSON, never crash
    return NextResponse.json(
      { maintenanceMode: false, error: "settings_unavailable" },
      { status: 200 },
    );
  }
}
