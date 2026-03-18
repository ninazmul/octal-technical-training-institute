"use client";

import { ICourseSafe } from "@/lib/database/models/course.model";
import RegistrationForm from "./RegistrationForm";
import { motion } from "framer-motion";
import {
  DollarSign,
  GraduationCap,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
} from "lucide-react";

type CheckoutProps = {
  course: ICourseSafe;
  email: string;
};

export default function Checkout({ course, email }: CheckoutProps) {
  return (
    <main className="w-full max-w-7xl mx-auto py-12 px-6 md:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-12">
        {/* Left Column: Sticky Course Summary */}
        <motion.aside
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-max lg:sticky lg:top-24 self-start"
        >
          <h1 className="text-3xl font-bold mb-6">{course.title}</h1>

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
        </motion.aside>

        {/* Right Column: Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <RegistrationForm course={course} email={email} />
        </motion.div>
      </div>
    </main>
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
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
      {icon}
      <span className="font-semibold">{label}:</span> {children}
    </div>
  );
}
