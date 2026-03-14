"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function HowToIdentify({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#000000";

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12 bg-gray-100">
      {/* Header Section */}
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
          {setting.howToIdentify?.badge}
        </div>

        {/* Title */}
        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          {setting.howToIdentify?.title}
        </h2>

        {/* Description */}
        {setting.howToIdentify?.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{
              __html: setting.howToIdentify.description,
            }}
          />
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center my-10 w-full max-w-6xl">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="order-2 md:order-1 flex flex-col md:items-start justify-start gap-4 w-full"
        >
          <div className="grid grid-cols-2 gap-4">
            {setting.howToIdentify?.features?.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-start gap-2 p-4 bg-white rounded-xl shadow-md w-full"
              >
                <BadgeCheck
                  style={{
                    backgroundColor: `${themeColor}30`,
                    borderColor: themeColor,
                    color: themeColor,
                  }}
                  className="rounded-md p-2 w-10 h-10 font-bold"
                />
                <p className="font-semibold text-start text-gray-800">
                  {feature}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="order-1 md:order-2"
        >
          <Image
            src={setting.howToIdentify?.image || "/assets/images/logo.png"}
            alt="How to Identify Image"
            height={500}
            width={500}
            priority
            className="rounded-xl shadow-lg"
          />
        </motion.div>
      </div>
    </main>
  );
}

export default HowToIdentify;
