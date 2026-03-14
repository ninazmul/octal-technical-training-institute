"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function Feedback({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#000000";

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        {/* Badge */}
        <div
          className="border rounded-full px-4 py-2 text-sm shadow-md flex items-center gap-2 w-max font-semibold"
          style={{
            backgroundColor: `${themeColor}20`,
            borderColor: themeColor,
            color: "#000000",
          }}
        >
          {setting.testimonials?.badge}
        </div>

        {/* Title */}
        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          {setting.testimonials?.title}
        </h2>

        {/* Description */}
        {setting.testimonials?.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{
              __html: setting.testimonials.description,
            }}
          />
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-3 gap-6 my-10 w-full max-w-4xl"
      >
        <div className="flex flex-col items-center gap-2">
          <p
            style={{ color: themeColor }}
            className="text-2xl md:text-4xl font-bold"
          >
            {setting.testimonials?.totalEnrollment}+
          </p>
          <p className="text-xs md:text-sm">Total Enrollments</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p
            style={{ color: themeColor }}
            className="text-2xl md:text-4xl font-bold"
          >
            {setting.testimonials?.totalSucceededStudents}%
          </p>
          <p className="text-xs md:text-sm">Successful Students</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p
            style={{ color: themeColor }}
            className="text-2xl md:text-4xl font-bold"
          >
            {setting.testimonials?.totalIndustryExperts}+
          </p>
          <p className="text-xs md:text-sm">Industry Experts</p>
        </div>
      </motion.div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl">
        {setting.testimonials?.feedbacks?.map((feedback, index) => {
          const firstLetter = feedback.name?.charAt(0).toUpperCase() || "?";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-4 p-4 md:p-6 bg-white rounded-2xl shadow-md text-center"
            >
              {/* Avatar */}
              {feedback.photo ? (
                <Image
                  src={feedback.photo}
                  alt={feedback.name || "User"}
                  width={50}
                  height={50}
                  className="rounded-full object-cover w-[50px] h-[50px]"
                />
              ) : (
                <div
                  className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {firstLetter}
                </div>
              )}

              {/* Name */}
              <p className="font-semibold text-gray-800">
                {feedback.name || "Anonymous"}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (feedback.rating || 0)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              {feedback.comment && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {feedback.comment}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}

export default Feedback;
