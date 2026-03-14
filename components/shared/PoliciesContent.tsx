"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";

export default function PoliciesContent({ settings }: { settings: ISetting }) {
  const themeColor = settings.theme || "#000000";

  return (
    <section className="py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="wrapper max-w-5xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold mb-12 text-center"
          style={{ color: themeColor }}
        >
          Policies
        </motion.h1>

        <div className="grid grid-cols-1 gap-12">
          {settings.returnPolicy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              id="return-policy"
              className="p-8 rounded-lg shadow-lg border"
              style={{ borderColor: themeColor, backgroundColor: "#ffffff" }}
            >
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: themeColor }}
              >
                Return Policy
              </h2>
              <div
                dangerouslySetInnerHTML={{ __html: settings.returnPolicy }}
              />
            </motion.div>
          )}

          {settings.termsOfService && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              id="terms-of-service"
              className="p-8 rounded-lg shadow-lg border"
              style={{ borderColor: themeColor, backgroundColor: "#ffffff" }}
            >
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: themeColor }}
              >
                Terms of Service
              </h2>
              <div
                className="
                prose prose-base max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-em:italic prose-em:text-gray-800
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-3 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
                "
                dangerouslySetInnerHTML={{ __html: settings.termsOfService }}
              />
            </motion.div>
          )}

          {settings.privacyPolicy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              id="privacy-policy"
              className="p-8 rounded-lg shadow-lg border"
              style={{ borderColor: themeColor, backgroundColor: "#ffffff" }}
            >
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: themeColor }}
              >
                Privacy Policy
              </h2>
              <div
                className="
                prose prose-base max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-em:italic prose-em:text-gray-800
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-3 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
                "
                dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
