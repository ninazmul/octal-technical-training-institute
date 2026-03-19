"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function Popup({ setting }: { setting: ISettingSafe | null }) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // ✅ Only on homepage
    if (pathname !== "/") return;

    if (!setting?.popup?.image) return;

    const { offerStartDate, offerEndDate } = setting.popup;

    const now = new Date();
    const start = offerStartDate ? new Date(offerStartDate) : null;
    const end = offerEndDate ? new Date(offerEndDate) : null;

    const isValid = (!start || now >= start) && (!end || now <= end);

    if (!isValid) return;

    // ✅ Show only once per session
    const alreadyShown = sessionStorage.getItem("popup_home_shown");
    if (alreadyShown) return;

    // slight delay → better UX
    const showTimer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("popup_home_shown", "true");
    }, 800);

    // auto close after 10 sec
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 10800); // 800ms delay + 10s visible

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [setting, pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-lg p-4 max-w-md w-full shadow-lg">
        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-500"
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
            className="rounded"
          />
        )}
      </div>
    </div>
  );
}
