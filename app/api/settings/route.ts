import { getSetting } from "@/lib/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const setting = await getSetting();

    return NextResponse.json({
      maintenanceMode: Boolean(setting?.maintenanceMode),
    });
  } catch (error) {
    console.error("Settings API error:", error);

    return NextResponse.json({
      maintenanceMode: false,
      error: "settings_unavailable",
    });
  }
}
