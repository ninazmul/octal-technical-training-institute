"use client";

import { INotice } from "@/lib/database/models/notice.model";
import Marquee from "react-fast-marquee";
import Link from "next/link";

function NoticeHeading({
  notices,
}: {
  notices: INotice[] | undefined;
}) {

  return (
    <div className="w-full bg-white py-4 ">
      {notices && (
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-6">
          {/* Left-side style badge */}
          <div
            className="bg-primary text-white rounded-full px-4 py-1 text-sm shadow-md font-semibold flex-shrink-0"
          >
            নোটিশঃ
          </div>

          {/* Scrollable notices */}
          <div className="flex-1 overflow-hidden">
            <Marquee gradient={false} speed={50} pauseOnHover autoFill>
              {notices.map((notice) => (
                <Link
                  key={notice._id.toString()}
                  href="/notices"
                  className="mx-6 text-gray-800 dark:text-gray-200 font-medium hover:underline line-clamp-2"
                >
                  {notice.title}
                </Link>
              ))}
            </Marquee>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeHeading;
