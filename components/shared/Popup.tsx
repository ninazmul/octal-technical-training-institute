"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [dismissedIndices, setDismissedIndices] = useState<Set<number>>(() => new Set());
  const popups = useMemo(
    () => (setting?.popups || []).filter((popup) =>
      Boolean(popup.image) && isInsideDisplayWindow(popup.offerStartDate, popup.offerEndDate),
    ),
    [setting?.popups],
  );

  useEffect(() => {
    if (pathname !== "/" || popups.length === 0) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => {
      setDismissedIndices(new Set());
      setActiveIndex(0);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [pathname, popups]);

  const navigate = useCallback((direction: -1 | 1) => {
    setActiveIndex((current) => {
      if (current === null || popups.length < 2) return current;
      for (let offset = 1; offset < popups.length; offset++) {
        const candidate = (current + direction * offset + popups.length) % popups.length;
        if (!dismissedIndices.has(candidate)) return candidate;
      }
      return current;
    });
  }, [dismissedIndices, popups.length]);

  const dismissCurrent = useCallback(() => {
    if (activeIndex === null) return;
    const dismissed = new Set(dismissedIndices);
    dismissed.add(activeIndex);
    setDismissedIndices(dismissed);

    for (let offset = 1; offset < popups.length; offset++) {
      const candidate = (activeIndex + offset) % popups.length;
      if (!dismissed.has(candidate)) {
        setActiveIndex(candidate);
        return;
      }
    }

    sessionStorage.setItem(STORAGE_KEY, "true");
    setActiveIndex(null);
  }, [activeIndex, dismissedIndices, popups.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const timer = window.setTimeout(dismissCurrent, DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, dismissCurrent]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissCurrent();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, dismissCurrent]);

  if (activeIndex === null || !popups[activeIndex]) return null;
  const popup = popups[activeIndex];
  const href = safePopupHref(popup.link);
  const image = (
    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
      <Image
        src={popup.image!}
        alt={popup.title || "Homepage promotion"}
        fill
        sizes="(max-width: 640px) 92vw, 640px"
        className="object-cover"
        priority
      />
      {href && (
        <a
          href={href}
          className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Click to open <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismissCurrent();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={popup.title || "Homepage promotion"}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {popups.length > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-slate-950/70 p-1 text-white backdrop-blur">
              <button type="button" onClick={() => navigate(-1)} aria-label="Previous popup" className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-xs font-semibold">{activeIndex + 1} / {popups.length}</span>
              <button type="button" onClick={() => navigate(1)} aria-label="Next popup" className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={dismissCurrent}
            aria-label="Close this popup"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur transition hover:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {image}

      </section>
    </div>
  );
}
