import { getSetting } from "@/lib/actions";
import { NextResponse } from "next/server";

export async function GET() {
  const setting = await getSetting();

  return NextResponse.json({
    maintenanceMode: setting?.maintenanceMode ?? false,
  });
}
