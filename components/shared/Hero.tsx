"use client";

import { ISettingSafe } from "@/lib/database/models/setting.model";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, GraduationCap } from "lucide-react";

function Hero({ setting }: { setting: ISettingSafe | null }) {
  const themeColor = setting?.theme || "#0055CE"; // LMS blue default

  const startDate = useMemo(
    () =>
      setting?.hero?.offerStartDate
        ? new Date(setting?.hero.offerStartDate)
        : new Date(),
    [setting?.hero?.offerStartDate],
  );

  const endDate = useMemo(
    () =>
      setting?.hero?.offerEndDate
        ? new Date(setting?.hero.offerEndDate)
        : new Date(),
    [setting?.hero?.offerEndDate],
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

  const [timeLeft, setTimeLeft] = useState<ReturnType<
    typeof calculateTimeLeft
  > | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(endDate));
    };

    updateTimer(); // first run

    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
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

  const titleParts = useMemo(() => {
    return setting?.hero?.title?.split(/[.,]/).filter(Boolean) || [];
  }, [setting?.hero?.title]);

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
            {/* Offer Banner */}
            {offerHours !== null && (
              <div
                className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold shadow-md mx-auto lg:mx-0 w-max"
                style={{
                  backgroundColor: `${themeColor}20`,
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                }}
              >
                <Clock size={16} />
                {offerHours}-ঘণ্টার বিশেষ ভর্তি সুযোগ!{" "}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 space-y-2">
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
            {setting?.hero?.description && (
              <div
                className="text-gray-700 text-base md:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0"
                dangerouslySetInnerHTML={{ __html: setting?.hero.description }}
              />
            )}

            {/* Countdown */}
            {timeLeft && (
              <div className="flex justify-center lg:justify-start gap-4">
                {Object.entries(timeLeft).map(([label, val], i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-white shadow rounded-lg px-2 lg:px-4 py-1 lg:py-2"
                  >
                    <span className="text-2xl font-bold text-gray-900">
                      {String(val).padStart(2, "0")}
                    </span>
                    <span className="text-xs uppercase text-gray-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              onClick={() =>
                document
                  .getElementById("courses") // <-- updated id
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full w-4/5 md:w-1/2 lg:w-1/2 mx-auto lg:mx-0 text-white font-semibold shadow-lg cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: themeColor }}
            >
              <GraduationCap size={22} />
              এনরোল করুন
            </div>

            {/* Contact */}
            <div className="text-gray-800 text-sm font-medium mb-6">
              সাহায্য দরকার? কল করুন: {setting?.phoneNumber}
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
              src={setting?.hero?.image || "/assets/images/logo.png"}
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
