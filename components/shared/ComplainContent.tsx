"use client";

import ComplainForm from "@/app/dashboard/components/ComplainForm";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import { CheckCircle, FileText, Info, Shield } from "lucide-react";

export default function ComplainContent({
  settings,
}: {
  settings: ISettingSafe | null;
}) {
  const themeColor = settings?.theme || "#0055CE";

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: themeColor }}
          >
            Submit a Complaint
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Have an issue or concern? Please share the details below. Our team
            will review and respond promptly.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT SIDE: Complaint Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 shadow-lg border"
            style={{ borderColor: `${themeColor}40` }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: themeColor }}
            >
              Guidelines
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} style={{ color: themeColor }} />
                <span>Clearly describe the issue you faced.</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={20} style={{ color: themeColor }} />
                <span>Attach any supporting documents or proof.</span>
              </div>
              <div className="flex items-start gap-3">
                <Info size={20} style={{ color: themeColor }} />
                <span>Provide accurate details (dates, references, etc.).</span>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={20} style={{ color: themeColor }} />
                <span>Keep your language respectful and professional.</span>
              </div>
            </div>

            <div className="mt-8 sm:mt-10">
              <h3
                className="text-lg sm:text-xl font-semibold mb-4"
                style={{ color: themeColor }}
              >
                Complaint Process
              </h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} style={{ color: themeColor }} />
                  <span>Submit your complaint using the form.</span>
                </div>
                <div className="flex items-start gap-3">
                  <FileText size={20} style={{ color: themeColor }} />
                  <span>Our team reviews and verifies details.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Info size={20} style={{ color: themeColor }} />
                  <span>You’ll receive updates via email/phone.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={20} style={{ color: themeColor }} />
                  <span>
                    Resolution will be shared within the stated timeframe.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Complaint Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 shadow-lg border"
            style={{ borderColor: `${themeColor}40` }}
          >
            <ComplainForm type="Create" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
