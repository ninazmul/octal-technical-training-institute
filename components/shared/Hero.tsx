"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Phone } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function Hero({ setting }: { setting: ISetting }) {
  const themeColor = setting.theme || "#000000";

  const startDate = useMemo(
    () =>
      setting.hero?.offerStartDate
        ? new Date(setting.hero.offerStartDate)
        : new Date(),
    [setting.hero?.offerStartDate],
  );

  const endDate = useMemo(
    () =>
      setting.hero?.offerEndDate
        ? new Date(setting.hero.offerEndDate)
        : new Date(),
    [setting.hero?.offerEndDate],
  );

  const calculateTimeLeft = useCallback((end: Date) => {
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateTimer = () => setTimeLeft(calculateTimeLeft(endDate));
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") updateTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    updateTimer();

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") updateTimer();
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endDate, calculateTimeLeft]);

  const calculateOfferHours = (start?: Date, end?: Date) => {
    if (!start || !end) return null;
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return null;
    return Math.floor(diff / (1000 * 60 * 60));
  };

  const offerHours = useMemo(
    () => calculateOfferHours(startDate, endDate),
    [startDate, endDate],
  );

  return (
    <main className="relative w-full">
      <div className="relative w-full h-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
        {/* Background Image */}
        <Image
          src={setting.hero?.image || "/assets/images/logo.png"}
          alt="Landing hero Background"
          fill
          priority
          className="object-cover opacity-40"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 md:gap-6 relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={setting.logo || "/assets/images/logo.png"}
              alt="Landing Logo"
              height={80}
              width={80}
              priority
              className=""
            />
          </motion.div>

          {/* Countdown */}
          {timeLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 bg-black/40 border border-gray-600 rounded-full px-4 md:px-6 py-3 shadow-lg flex flex-wrap items-center justify-center gap-3"
            >
              <span className="text-sm md:text-2xl font-bold text-white">
                ⏳ Offer ending soon!
              </span>
              <div className="flex items-center gap-2">
                {[
                  timeLeft.days,
                  timeLeft.hours,
                  timeLeft.minutes,
                  timeLeft.seconds,
                ].map((val, i) => (
                  <div key={i} className="flex items-center">
                    <p className="text-sm md:text-2xl font-bold text-white bg-white/20 px-2 md:px-3 py-1 rounded-lg border border-gray-500">
                      {String(val).padStart(2, "0")}
                    </p>
                    {i < 3 && (
                      <span className="text-sm md:text-2xl font-bold text-white">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {setting.hero?.title
              ?.split(/[.,]/)
              .filter(Boolean)
              .map((part, index) => (
                <motion.span
                  key={index}
                  className="block"
                  style={{ color: index === 1 ? themeColor : "#ffffff" }}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl text-gray-200 text-lg md:text-xl"
              dangerouslySetInnerHTML={{ __html: setting.hero.description }}
            />
          )}

          {/* Offer Badge + CTA */}
          {offerHours !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 bg-white p-4 md:p-6 rounded-xl space-y-4 max-w-xl w-full shadow-lg"
            >
              {/* Offer Badge */}
              <div
                className="border rounded-full px-4 py-2 text-sm shadow-md flex items-center gap-2 w-max mx-auto font-semibold"
                style={{
                  backgroundColor: `${themeColor}20`,
                  borderColor: themeColor,
                  color: "#000000",
                }}
              >
                🎉 Special {offerHours}-hour offer! ⏰
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "✅ 100% Genuine",
                  "🚚 Fast Delivery",
                  "🔒 Secure Payment",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="border rounded-full px-3 py-2 text-sm shadow-md bg-gray-100 font-semibold"
                  >
                    {text}
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  document
                    .getElementById("checkout")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-black font-semibold shadow-lg cursor-pointer w-full max-w-xs mx-auto"
                style={{ backgroundColor: themeColor }}
              >
                <Phone size={18} />
                Order Now!
              </motion.div>
              <div className="text-black text-sm text-center font-semibold">
                Call Now: {setting.phoneNumber}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default Hero;
