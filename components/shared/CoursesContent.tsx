"use client";

import { ICourse } from "@/lib/database/models/course.model";
import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function Courses({
  setting,
  courses,
}: {
  setting: ISetting;
  courses?: ICourse[];
}) {
  const themeColor = setting.theme || "#0055CE";

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="border rounded-full px-4 py-2 text-sm shadow-md flex items-center gap-2 w-max font-semibold"
          style={{
            backgroundColor: `${themeColor}20`,
            borderColor: themeColor,
            color: "#000000",
          }}
        >
          জনপ্রিয় কোর্সসমূহ
        </div>

        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          আমাদের কোর্সসমূহ অন্বেষণ করুন
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl text-gray-600 text-lg md:text-xl"
        >
          বিভিন্ন ধরনের কোর্সের মাধ্যমে আপনার দক্ষতা ও জ্ঞান বৃদ্ধি করুন। নিজস্ব
          গতিতে শিখুন এবং বিশেষজ্ঞদের পরিচালিত কন্টেন্ট দিয়ে আপনার ক্যারিয়ার
          এগিয়ে নিন।
        </motion.p>
      </motion.div>

      {/* Courses List */}
      <motion.div
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {courses &&
          courses.slice(0, 3).map((course) => (
            <motion.div
              key={course._id.toString()}
              className="border rounded-2xl overflow-hidden shadow-md flex flex-col bg-white"
              whileHover={{ scale: 1.02 }}
            >
              {/* Course Image */}
              <div className="relative w-full h-48">
                <Image
                  src={course.photo}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Course Info */}
              <div className="p-5 flex flex-col flex-1 text-left">
                <Link href={`/courses/${course._id}`}>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 line-clamp-2 hover:text-primary transition">
                    {course.title}
                  </h3>
                </Link>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">
                    টাকা {course.discountPrice || course.price}
                  </span>
                  {course.isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                      }}
                    >
                      সক্রিয়
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* More Button */}
      {courses && courses.length > 3 && (
        <Link
          href="/courses"
          className="mt-10 inline-block border-2 border-primary hover:bg-blue-100 text-primary font-semibold py-2 px-4 rounded-xl shadow-md transition-colors"
        >
          আরও কোর্স দেখুন
        </Link>
      )}
    </main>
  );
}

export default Courses;
