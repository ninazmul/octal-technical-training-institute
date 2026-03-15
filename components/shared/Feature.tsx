"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { Check } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function Feature({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#0055CE";

  return (
    <main className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12">
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
          {setting.features?.badge}
        </div>

        {/* Title */}
        <h2
          className="text-3xl md:text-5xl font-bold"
          style={{ color: themeColor }}
        >
          {setting.features?.title}
        </h2>

        {/* Description */}
        {setting.features?.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{ __html: setting.features.description }}
          />
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center my-10 w-full max-w-6xl">
        {/* Image */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={setting.features?.image || "/assets/images/logo.png"}
            alt="Feature Image"
            height={500}
            width={500}
            priority
            className="rounded-xl shadow-lg"
          />
        </motion.div>

        {/* Text + Features */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:items-start justify-center gap-6 w-full"
        >
          <h3 className="font-semibold text-xl">Our Promise:</h3>

          {/* We Give You */}
          <div className="flex flex-col gap-4">
            {setting.features?.weGiveYou?.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-3 p-4 bg-white rounded-md shadow-md"
              >
                <Check
                  style={{
                    backgroundColor: `${themeColor}30`,
                    borderColor: themeColor,
                    color: themeColor,
                  }}
                  className="rounded-md p-2 w-10 h-10 font-bold"
                />
                <p className="font-semibold text-gray-800">{feature}</p>
              </motion.div>
            ))}

            {/* We Do Not Give You */}
            <div
              style={{
                backgroundColor: `${themeColor}15`,
                borderColor: themeColor,
                color: "#000000",
              }}
              className="p-5 rounded-xl shadow-md"
            >
              <h3 className="font-semibold text-lg text-start pb-3">
                We Don’t:
              </h3>
              <div className="flex flex-wrap gap-3">
                {setting.features?.weDoNotGiveYou?.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm text-gray-700"
                  >
                    ❌ <p>{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default Feature;
