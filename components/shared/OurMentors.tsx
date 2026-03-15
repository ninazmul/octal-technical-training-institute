"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { motion } from "framer-motion";
import { Facebook, Linkedin, Twitter, Globe } from "lucide-react";

function OurMentors({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#000000";

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12 bg-gray-100">
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
          {setting.ourMentors?.badge}
        </div>

        {/* Title */}
        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          {setting.ourMentors?.title}
        </h2>

        {/* Description */}
        {setting.ourMentors?.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{
              __html: setting.ourMentors.description,
            }}
          />
        )}
      </motion.div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mt-10">
        {setting.ourMentors?.mentors?.map((mentor, index) => {
          const firstLetter = mentor.name?.charAt(0).toUpperCase() || "?";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-4 p-2 md:p-6 bg-white rounded-2xl shadow-md text-center"
            >
              {/* Avatar */}
              <div className="relative w-[120px] h-[120px] flex items-end justify-center">
                {/* Circle background */}
                <div className="absolute bottom-0 w-[120px] h-[120px] rounded-full bg-gradient-to-b from-blue-200 to-blue-400 shadow-md" />

                {/* Transparent mentor image */}
                {mentor.photo ? (
                  <Image
                    src={mentor.photo}
                    alt={mentor.name || "Mentor"}
                    width={120}
                    height={150} // taller than circle
                    className="object-contain relative bottom-0"
                  />
                ) : (
                  <div
                    className="w-[120px] h-[120px] flex items-center justify-center text-5xl font-bold text-white rounded-full relative bottom-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    {firstLetter}
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="font-semibold text-gray-800 text-lg line-clamp-2 truncate">
                {mentor.name || "Anonymous"}
              </p>

              {/* Expertise */}
              {mentor.expertise && (
                <p className="text-gray-600 text-sm line-clamp-1 truncate">
                  {mentor.expertise}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {mentor.social?.facebook && (
                  <a
                    href={mentor.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-5 h-5 text-blue-600 hover:opacity-80" />
                  </a>
                )}
                {mentor.social?.linkedIn && (
                  <a
                    href={mentor.social.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700 hover:opacity-80" />
                  </a>
                )}
                {mentor.social?.twitter && (
                  <a
                    href={mentor.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5 text-sky-500 hover:opacity-80" />
                  </a>
                )}
                {mentor.social?.other && (
                  <a
                    href={mentor.social.other}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="w-5 h-5 text-gray-500 hover:opacity-80" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}

export default OurMentors;
