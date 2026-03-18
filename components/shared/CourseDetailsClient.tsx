"use client";

import Image from "next/image";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  GraduationCap,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function CourseDetailsClient({
  course,
}: {
  course: ICourseSafe;
}) {
  return (
    <main className="w-full max-w-7xl mx-auto py-12 px-6 md:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12">
        {/* Left Column: Main Content */}
        <div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-snug text-gray-900 dark:text-gray-100 mb-4">
              {course.title}
            </h1>
            <div
              className="prose prose-base max-w-none dark:prose-invert text-justify"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </motion.div>

          {/* Course Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full mb-10 rounded-2xl overflow-hidden shadow-xl group"
          >
            <Image
              src={course.photo || "/assets/images/placeholder.png"}
              alt={course.title}
              width={1200}
              height={0}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          {/* Modules (only show here on lg screens) */}
          <div className="hidden lg:block mb-12">
            <h2 className="text-2xl font-semibold mb-6">Course Modules</h2>
            {course.modules?.length ? (
              <div className="space-y-4">
                {course.modules.map((m, idx) => (
                  <ModuleAccordion key={idx} module={m} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No modules defined yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          <InfoCard title="Course Details">
            {/* Info Items */}
            <InfoItem icon={<DollarSign size={18} />} label="Price">
              {course.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500 line-through text-sm">
                    টাকা {course.price}
                  </span>
                  <span className="text-green-600 font-bold">
                    টাকা {course.discountPrice}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-gray-900">
                  টাকা {course.price}
                </span>
              )}
            </InfoItem>
            <InfoItem icon={<GraduationCap size={18} />} label="Batch">
              {course.batch || "N/A"}
            </InfoItem>
            <InfoItem icon={<CalendarDays size={18} />} label="Start Date">
              {course.courseStartDate || "TBA"}
            </InfoItem>
            <InfoItem icon={<Clock size={18} />} label="Duration">
              {course.duration || "N/A"}
            </InfoItem>
            <InfoItem icon={<BookOpen size={18} />} label="Sessions">
              {course.sessions || "N/A"}
            </InfoItem>
            <InfoItem icon={<Users size={18} />} label="Seats">
              {Number(course.seats) > 0
                ? `${Number(course.seats)} available`
                : "No seats left"}
            </InfoItem>
            <InfoItem
              icon={<AlertCircle size={18} />}
              label="Registration Deadline"
            >
              {course.registrationDeadline || "Not specified"}
            </InfoItem>
          </InfoCard>

          <InfoCard title="Prerequisites">
            {course.prerequisites?.length ? (
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                {course.prerequisites.map((item, idx) => (
                  <li
                    key={idx}
                    className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-gray-700 dark:before:text-gray-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No prerequisites listed.
              </p>
            )}
          </InfoCard>

          {/* Enroll Button */}
          <div>
            {(() => {
              const seatsAvailable = Number(course.seats) > 0;
              const deadline = course.registrationDeadline
                ? new Date(course.registrationDeadline)
                : null;
              const now = new Date();
              const deadlinePassed = deadline ? now > deadline : false;

              const active = seatsAvailable && !deadlinePassed;

              if (active) {
                return (
                  <Link href={`/checkout/${course._id.toString()}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors"
                    >
                      Enroll Now
                    </motion.button>
                  </Link>
                );
              }

              return (
                <motion.button
                  disabled
                  className="w-full bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-md cursor-not-allowed"
                >
                  {seatsAvailable ? "Deadline Passed" : "No Seats Available"}
                </motion.button>
              );
            })()}
          </div>
        </aside>
      </div>

      {/* Modules for small/medium screens */}
      <div className="block lg:hidden mt-12">
        <h2 className="text-2xl font-semibold mb-6">Course Modules</h2>
        {course.modules?.length ? (
          <div className="space-y-4">
            {course.modules.map((m, idx) => (
              <ModuleAccordion key={idx} module={m} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No modules defined yet.
          </p>
        )}
      </div>
    </main>
  );
}

// Reusable Info Card
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}

// Reusable Info Item
function InfoItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      {icon}
      <span className="font-semibold">{label}:</span> {children}
    </div>
  );
}

// Accordion
function ModuleAccordion({
  module,
}: {
  module: { title: string; content: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-xl overflow-hidden shadow-sm"
    >
      <button
        className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 font-semibold flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {module.title}
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: open ? 500 : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {module.content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
