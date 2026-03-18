"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  FaBookOpen,
  FaChalkboardTeacher,
  FaCertificate,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { JSX } from "react";

// Map string keys from DB to actual React Icons
const ICONS: Record<string, JSX.Element> = {
  FaBookOpen: <FaBookOpen className="w-10 h-10 p-2 text-sky-500" />,
  FaChalkboardTeacher: (
    <FaChalkboardTeacher className="w-10 h-10 p-2 text-emerald-500" />
  ),
  FaCertificate: <FaCertificate className="w-10 h-10 p-2 text-green-500" />,
  FaUsers: <FaUsers className="w-10 h-10 p-2 text-yellow-500" />,
};

function LMSFeatures({ setting }: { setting: ISettingSafe | null }) {
  const themeColor = setting?.theme || "#0055CE";

  // Use setting?.features if it exists, otherwise fallback
  const features = setting?.features?.items || [];

  return (
    <main
      className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12"
      style={{ backgroundColor: themeColor }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-white border rounded-full px-4 py-2 text-sm shadow-md flex items-center gap-2 w-max font-semibold bg-black/25">
          {setting?.features?.badge || "বৈশিষ্ট্যসমূহ"}
        </div>
        <h2 className="text-white text-3xl md:text-5xl font-bold">
          {setting?.features?.title || "আপনার শেখার যাত্রাকে শক্তিশালী করুন"}
        </h2>
        <div
          className="max-w-3xl text-white text-lg md:text-xl"
          dangerouslySetInnerHTML={{
            __html:
              setting?.features?.description ||
              "<p>কোর্স অন্বেষণ করুন, বিশেষজ্ঞদের সাথে যুক্ত হোন, এবং সহজেই সার্টিফিকেশন অর্জন করুন।</p>",
          }}
        />
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-6xl">
        {features.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-3 p-4 md:p-6 bg-black/25 rounded-xl shadow-lg text-white"
          >
            {ICONS[item.icon || ""] || (
              <FaBookOpen className="w-10 h-10 p-2 text-sky-500" />
            )}
            <p className="font-semibold text-lg">{item.title}</p>
            <p className="text-sm text-gray-200">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

export default LMSFeatures;
