"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import { FaCheckCircle, FaHeadset, FaShieldAlt, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

function RiskFreeOrder({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#000000";

  const items = [
    {
      icon: <FaTruck className="w-10 h-10 p-2 text-blue-600" />,
      title: "Check on Delivery",
      desc: "Inspect the product before accepting it",
    },
    {
      icon: <FaShieldAlt className="w-10 h-10 p-2 text-emerald-500" />,
      title: "100% Money-Back Guarantee",
      desc: "Full refund if not satisfied",
    },
    {
      icon: <FaHeadset className="w-10 h-10 p-2 text-yellow-500" />,
      title: "24/7 Customer Support",
      desc: "Quick help for any issues",
    },
    {
      icon: <FaCheckCircle className="w-10 h-10 p-2 text-green-500" />,
      title: "Premium Quality Assured",
      desc: "Delivered after strict quality checks",
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
          Risk-Free Order
        </div>
        <h2 className="text-white text-3xl md:text-5xl font-bold">
          Place a Risk-Free Order
        </h2>
        <p className="max-w-3xl text-white text-lg md:text-xl">
          Test the product on delivery – return it immediately if not satisfied!
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

export default RiskFreeOrder;
