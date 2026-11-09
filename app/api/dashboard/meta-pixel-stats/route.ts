import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

const DEFAULT_PIXEL_ID = "1991224284569638";
const ALLOWED_RANGES = [7, 30, 90] as const;

type MetaPixelEventRow = {
  event?: string;
  value?: string;
  count?: number | string;
  start_time?: number | string;
};

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const email = await getUserEmailById(userId);
  if (!email || !(await isAdmin(email))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const accessToken = process.env.META_PIXEL_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      {
        configured: false,
        message: "Add META_PIXEL_ACCESS_TOKEN to the server environment to load Meta Pixel stats.",
      },
      { status: 200 },
    );
  }

  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? 7);
  const days = ALLOWED_RANGES.includes(daysParam as (typeof ALLOWED_RANGES)[number])
    ? daysParam
    : 7;
  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v27.0";
  const url = new URL(
    `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pixelId)}/stats`,
  );
  url.searchParams.set("aggregation", "event");
  url.searchParams.set("start_time", String(Math.floor(since.getTime() / 1000)));
  url.searchParams.set("end_time", String(Math.floor(now.getTime() / 1000)));
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) {
      console.error("Meta Pixel stats request failed:", result?.error?.message);
      return NextResponse.json(
        { configured: true, message: "Meta could not return Pixel stats. Check the token and Pixel permissions." },
        { status: 502 },
      );
    }

    const eventTotals = new Map<string, number>();
    for (const row of (result.data ?? []) as MetaPixelEventRow[]) {
      const name = row.event || row.value || "Unknown event";
      const count = Number(row.count ?? 0);
      if (Number.isFinite(count)) {
        eventTotals.set(name, (eventTotals.get(name) ?? 0) + count);
      }
    }

    const events = [...eventTotals.entries()]
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      configured: true,
      pixelId,
      days,
      fetchedAt: now.toISOString(),
      totalEvents: events.reduce((sum, event) => sum + event.count, 0),
      pageViews: events.find((event) => event.event === "PageView")?.count ?? 0,
      completedRegistrations:
        events.find((event) => event.event === "CompleteRegistration")?.count ?? 0,
      events,
    });
  } catch (error) {
    console.error("Meta Pixel stats request error:", error);
    return NextResponse.json(
      { configured: true, message: "Unable to connect to Meta Pixel stats." },
      { status: 502 },
    );
  }
}
