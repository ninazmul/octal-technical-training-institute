"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PixelStats = {
  configured: boolean;
  message?: string;
  pixelId?: string;
  days?: number;
  fetchedAt?: string;
  totalEvents?: number;
  pageViews?: number;
  completedRegistrations?: number;
  events?: { event: string; count: number }[];
};

const numberFormat = new Intl.NumberFormat("en-BD");

export default function MetaPixelStatsCard() {
  const [days, setDays] = useState("7");
  const [stats, setStats] = useState<PixelStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/dashboard/meta-pixel-stats?days=${days}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as PixelStats;
        if (!response.ok) throw new Error(data.message || "Could not load Meta Pixel stats.");
        setStats(data);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load Meta Pixel stats.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [days]);

  return (
    <Card className="border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl xl:col-span-3">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Meta Pixel Stats</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Events received by Meta Pixel{stats?.pixelId ? ` ${stats.pixelId}` : ""}.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36 bg-white" aria-label="Meta Pixel date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading stats from Meta…</p>
        ) : error ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</p>
        ) : !stats?.configured ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            {stats?.message || "Configure META_PIXEL_ACCESS_TOKEN on the server to load Meta data."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat title="PageViews" value={stats.pageViews ?? 0} />
              <Stat title="CompleteRegistration" value={stats.completedRegistrations ?? 0} />
              <Stat title="All Pixel Events" value={stats.totalEvents ?? 0} />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr><th className="py-2">Event</th><th className="py-2 text-right">Count</th></tr>
                </thead>
                <tbody>
                  {(stats.events ?? []).map((event) => (
                    <tr key={event.event} className="border-b last:border-0">
                      <td className="py-2 font-medium">{event.event}</td>
                      <td className="py-2 text-right tabular-nums">{numberFormat.format(event.count)}</td>
                    </tr>
                  ))}
                  {!stats.events?.length ? (
                    <tr><td colSpan={2} className="py-6 text-center text-slate-500">Meta returned no Pixel events for this period.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {stats.fetchedAt ? (
              <p className="mt-3 text-xs text-slate-400">
                Meta event counts can differ from unique visitors. Updated {new Date(stats.fetchedAt).toLocaleString()}.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white/80 p-4">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {numberFormat.format(value)}
      </p>
    </div>
  );
}
