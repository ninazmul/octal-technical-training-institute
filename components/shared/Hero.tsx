"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

function Hero({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#2563eb";

  const titleParts = useMemo(() => {
    return setting.hero?.title?.split(/[.,]/).filter(Boolean) || [];
  }, [setting.hero?.title]);

  return (
    <section className="relative w-full bg-gradient-to-r from-blue-50 to-indigo-100 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col w-full lg:w-1/2 gap-6 text-center lg:text-left"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-6xl lg:text-6xl font-bold leading-tight text-gray-900 space-y-2">
              {titleParts.map((part, index) => (
                <motion.span
                  key={index}
                  className="block"
                  style={{ color: index === 1 ? themeColor : "#000000" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                >
                  {part.trim()}
                </motion.span>
              ))}
            </h1>

            {/* Description */}
            {setting.hero?.description && (
              <div
                className="text-gray-700 text-base md:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0"
                dangerouslySetInnerHTML={{ __html: setting.hero.description }}
              />
            )}

            {/* CTA */}
            <div
              onClick={() =>
                document
                  .getElementById("checkout")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: themeColor }}
            >
              <GraduationCap size={22} />
              Enroll Now
            </div>

            {/* Contact */}
            <div className="text-gray-800 text-sm font-medium mb-6">
              Need help? Call: {setting.phoneNumber}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full lg:w-1/2 h-[300px] md:h-[500px]"
          >
            <Image
              src={setting.hero?.image || "/assets/images/lms-hero.jpg"}
              alt="Learning Hero"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
