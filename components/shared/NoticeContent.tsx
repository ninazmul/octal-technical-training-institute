"use client";

import { INotice } from "@/lib/database/models/notice.model";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { getAllNotices } from "@/lib/actions/notice.actions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NoticePage({
  settings,
}: {
  settings: ISettingSafe | null;
}) {
  const themeColor = settings?.theme || "#0055CE";
  const [notices, setNotices] = useState<INotice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getAllNotices();
        // sort by createdAt descending
        const sorted = data.sort((a: INotice, b: INotice) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setNotices(sorted);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: themeColor }}
          >
            Notices
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Stay updated with the latest announcements and important
            information.
          </p>
        </motion.div>

        {/* Notices List */}
        <div className="space-y-6">
          {notices.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No notices available.
            </p>
          ) : (
            notices.map((notice) => (
              <motion.div
                key={notice._id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between rounded-lg shadow-sm bg-white dark:bg-gray-800"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                    {notice.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {notice.createdAt
                      ? new Date(notice.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date not available"}
                  </p>
                </div>

                {notice.file && (
                  <a
                    href={notice.file}
                    target="_blank"
                    className="inline-block mt-3 md:mt-0 md:ml-4 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90"
                  >
                    Download File
                  </a>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
