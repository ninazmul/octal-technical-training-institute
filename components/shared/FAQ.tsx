"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FAQ({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#0055CE";
  const faqs = setting.faqs?.items || [];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <main className="w-full py-12 md:py-20 px-6 md:px-12 bg-gray-100">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center">
        {setting.faqs?.badge && (
          <div
            className="border rounded-full px-4 py-2 text-sm shadow-md inline-flex items-center gap-2 font-semibold"
            style={{
              backgroundColor: `${themeColor}20`,
              borderColor: themeColor,
              color: "#000000",
            }}
          >
            {setting.faqs.badge}
          </div>
        )}

        {setting.faqs?.title && (
          <h2
            className="text-3xl md:text-5xl font-bold my-4"
            style={{ color: themeColor }}
          >
            {setting.faqs.title}
          </h2>
        )}

        {setting.faqs?.description && (
          <div
            className="max-w-3xl mx-auto text-gray-600 text-lg md:text-xl"
            dangerouslySetInnerHTML={{
              __html: setting.faqs.description,
            }}
          />
        )}
      </div>

      {/* Accordion */}
      <div className="max-w-4xl mx-auto mt-10 space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-lg focus:outline-none"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: themeColor }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ maxHeight: 0, opacity: 0 }}
                    animate={{ maxHeight: 500, opacity: 1 }}
                    exit={{ maxHeight: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="px-5 pb-5 text-gray-600 leading-relaxed overflow-hidden"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}

export default FAQ;
