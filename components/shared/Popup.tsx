"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { ISettingSafe } from "@/lib/database/models/setting.model";

const STORAGE_KEY = "homepage_popups_seen_v2";
const DISPLAY_MS = 9000;

function safePopupHref(value?: string) {
  const link = value?.trim();
  if (!link) return "";
  if (/[\\\u0000-\u001f]/.test(link)) return "";
  if (/^https?:\/\//i.test(link)) return link;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  return "";
}

function isInsideDisplayWindow(startValue?: string, endValue?: string) {
  const now = Date.now();
  const start = startValue ? new Date(startValue).getTime() : NaN;
  let end = endValue ? new Date(endValue).getTime() : NaN;
  // Date inputs represent calendar days; include the full end date.
  if (endValue && /^\d{4}-\d{2}-\d{2}$/.test(endValue)) end += 24 * 60 * 60 * 1000 - 1;
  return (!startValue || (!Number.isNaN(start) && now >= start)) &&
    (!endValue || (!Number.isNaN(end) && now <= end));
}

export default function Popup({ setting }: { setting: ISettingSafe | null }) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const popups = useMemo(
    () => (setting?.popups || []).filter((popup) =>
      Boolean(popup.image) && isInsideDisplayWindow(popup.offerStartDate, popup.offerEndDate),
    ),
    [setting?.popups],
  );

  useEffect(() => {
    if (pathname !== "/" || popups.length === 0) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setActiveIndex(0), 700);
    return () => window.clearTimeout(timer);
  }, [pathname, popups]);

  const advance = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return null;
      if (current + 1 >= popups.length) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        return null;
      }
      return current + 1;
    });
  }, [popups.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const timer = window.setTimeout(advance, DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, advance]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") advance();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, advance]);

  if (activeIndex === null || !popups[activeIndex]) return null;
  const popup = popups[activeIndex];
  const href = safePopupHref(popup.link);
  const image = (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-[16/10]">
      <Image
        src={popup.image!}
        alt={popup.title || "Homepage promotion"}
        fill
        sizes="(max-width: 640px) 92vw, 640px"
        className="object-contain"
        priority
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) advance();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={popup.title || "Homepage promotion"}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {popups.length > 1 && (
            <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {activeIndex + 1} / {popups.length}
            </span>
          )}
          <button
            type="button"
            onClick={advance}
            aria-label="Close popup and continue"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur transition hover:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {href ? (
          <a href={href} aria-label={`Open ${popup.title || "promotion"}`} className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-500">
            {image}
          </a>
        ) : image}

        {(popup.title || href) && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{popup.title || "Special offer"}</h2>
            {href && (
              <a href={href} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
                View details <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        <div className="h-1 w-full bg-slate-100">
          <div key={activeIndex} className="h-full origin-left animate-popup-progress bg-blue-700" />
        </div>
      </section>
      <style jsx>{`
        .animate-popup-progress { animation: popup-progress ${DISPLAY_MS}ms linear forwards; }
        @keyframes popup-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      `}</style>
    </div>
  );
}
