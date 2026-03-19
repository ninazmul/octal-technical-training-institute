"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function Popup({ setting }: { setting: ISettingSafe | null }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    if (!setting?.popup?.image) return;

    const { offerStartDate, offerEndDate } = setting.popup;
    const now = new Date();
    const start = offerStartDate ? new Date(offerStartDate) : null;
    const end = offerEndDate ? new Date(offerEndDate) : null;
    const isValid = (!start || now >= start) && (!end || now <= end);
    if (!isValid) return;

    const alreadyShown = sessionStorage.getItem("popup_home_shown");
    if (alreadyShown) return;

    // Delay before showing (but only after image load success)
    const showTimer = setTimeout(() => {
      sessionStorage.setItem("popup_home_shown", "true");

      // progress countdown (10s)
      const duration = 10000;
      const interval = 100;
      let elapsed = 0;
      const progressTimer = setInterval(() => {
        elapsed += interval;
        setProgress(100 - (elapsed / duration) * 100);
        if (elapsed >= duration) {
          clearInterval(progressTimer);
          setVisible(false);
        }
      }, interval);
    }, 800);

    return () => {
      clearTimeout(showTimer);
    };
  }, [setting, pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative bg-white rounded-lg p-4 max-w-md w-full shadow-lg transform transition-all duration-500 scale-100">
        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {/* Image (controls visibility) */}
        {setting?.popup?.image && (
          <Image
            src={setting.popup.image}
            alt="Popup"
            width={500}
            height={300}
            className="rounded transition-transform duration-500 hover:scale-105"
            onLoadingComplete={() => setVisible(true)} // show only when loaded
          />
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
