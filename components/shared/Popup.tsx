"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function Popup({ setting }: { setting: ISettingSafe | null }) {
  const [visible, setVisible] = useState(false);
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

    if (sessionStorage.getItem("popup_home_shown")) return;

    const showTimer = setTimeout(() => {
      sessionStorage.setItem("popup_home_shown", "true");
      setVisible(true);

      // Auto-close after 10s
      setTimeout(() => setVisible(false), 10000);
    }, 800);

    return () => clearTimeout(showTimer);
  }, [setting, pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-500">
      <div className="relative bg-white rounded-lg p-4 max-w-md w-full shadow-lg">
        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {/* Image */}
        {setting?.popup?.image && (
          <Image
            src={setting.popup.image}
            alt="Popup"
            width={500}
            height={300}
            className="rounded transition-transform duration-500 hover:scale-105"
          />
        )}

        {/* Progress Bar (CSS-driven) */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress" />
        </div>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        .animate-progress {
          width: 100%;
          animation: shrink 10s linear forwards;
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
