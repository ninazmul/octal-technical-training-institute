"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import {
  FaBookOpen,
  FaChalkboardTeacher,
  FaCertificate,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";

function LMSFeatures({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#0055CE";

  const items = [
    {
      icon: <FaBookOpen className="w-10 h-10 p-2 text-sky-500" />,
      title: "সমৃদ্ধ কোর্স লাইব্রেরি",
      desc: "যেকোনো সময় বিস্তৃত কোর্সসমূহে প্রবেশাধিকার পান।",
    },
    {
      icon: <FaChalkboardTeacher className="w-10 h-10 p-2 text-emerald-500" />,
      title: "অভিজ্ঞ প্রশিক্ষক",
      desc: "শিল্পের পেশাদারদের কাছ থেকে সরাসরি শিখুন।",
    },
    {
      icon: <FaUsers className="w-10 h-10 p-2 text-yellow-500" />,
      title: "সহযোগিতামূলক শিক্ষা",
      desc: "আলোচনা ও প্রকল্পের মাধ্যমে সহপাঠীদের সাথে যুক্ত হোন।",
    },
    {
      icon: <FaCertificate className="w-10 h-10 p-2 text-green-500" />,
      title: "স্বীকৃত অর্জন",
      desc: "আপনার ক্যারিয়ারকে এগিয়ে নিতে স্বীকৃত সার্টিফিকেট অর্জন করুন।",
    },
  ];

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
          LMS বৈশিষ্ট্যসমূহ
        </div>
        <h2 className="text-white text-3xl md:text-5xl font-bold">
          আপনার শেখার যাত্রাকে শক্তিশালী করুন
        </h2>
        <p className="max-w-3xl text-white text-lg md:text-xl">
          কোর্স অন্বেষণ করুন, বিশেষজ্ঞদের সাথে যুক্ত হোন, এবং সহজেই সার্টিফিকেশন
          অর্জন করুন।
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-6xl">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-3 p-4 md:p-6 bg-black/25 rounded-xl shadow-lg text-white"
          >
            {item.icon}
            <p className="font-semibold text-lg">{item.title}</p>
            <p className="text-sm text-gray-200">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

export default LMSFeatures;
