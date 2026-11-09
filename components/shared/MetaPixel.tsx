"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const PIXEL_ID = "1991224284569638";
const sentCourseEnrollmentEvents = new Set<string>();

function trackCourseEnrollmentFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("course_enrollment") !== "success") return;

  const eventId = params.get("event_id");
  if (!eventId || !window.fbq) return;
  if (sentCourseEnrollmentEvents.has(eventId)) return;

  const storageKey = `meta-course-enrollment-${eventId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
  } catch {
    // Continue tracking when browser storage is unavailable.
  }

  window.fbq(
    "track",
    "CompleteRegistration",
    { content_category: "Course" },
    { eventID: eventId },
  );
  sentCourseEnrollmentEvents.add(eventId);
  try {
    window.sessionStorage.setItem(storageKey, "sent");
  } catch {
    // In-memory deduplication still prevents repeat events on this page.
  }
}

declare global {
  interface Window {
    fbq?: ((...args: (string | Record<string, unknown>)[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      push?: (...args: unknown[]) => void;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: Window["fbq"];
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (!pathname || previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  useEffect(trackCourseEnrollmentFromUrl, []);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={trackCourseEnrollmentFromUrl}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
              t=b.createElement(e);t.async=!0;t.src=v;
              s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
            }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${PIXEL_ID}');
            fbq('track','PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
