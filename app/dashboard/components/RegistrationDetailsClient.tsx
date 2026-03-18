"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  DollarSign,
  GraduationCap,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  User,
  Mail,
  Phone,
  Clipboard,
  Printer,
} from "lucide-react";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function RegistrationDetailsClient({
  registration,
  course,
  settings,
}: {
  registration: SerializedRegistration;
  course: ICourseSafe | null;
  settings: ISettingSafe | null;
}) {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) return;

    win.document.write(`
    <html>
      <head>
        <title>Registration Details</title>
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; color: #222; line-height: 1; margin: 0; padding: 30px; }
          header { text-align: center; margin-bottom: 1em; }
          header img { height: 35px; margin-bottom: 10px; }
          h1 { font-size: 18pt; margin: 0; font-weight: 600; }
          h2 { font-size: 14pt; margin-top: 1.5em; padding-bottom: 6px; border-bottom: 2px solid #444; text-transform: uppercase; letter-spacing: 0.5px; }
          .student-info { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5em; }
          .photo-container { width: 120px; height: 140px; border: 1px solid #ccc; overflow: hidden; border-radius: 4px; }
          .photo-container img { width: 100%; height: 100%; object-fit: cover; }
          table { width: 100%; border-collapse: collapse; margin-top: 0.5em; margin-bottom: 0.5em}
          th, td { padding: 10px 14px; border: 1px solid #ccc; font-size: 11pt; }
          th { background-color: #f0f0f0; font-weight: 600; color: #222; }
          tr:nth-child(even) td { background-color: #fafafa; }
          footer { text-align: center; font-size: 10pt; margin-top: 1em; padding-top: 1em; margin-bottom: 1em; }
        </style>
      </head>
      <body>
        <header>
          <img src="${settings?.logo || "/assets/images/logo.png"}" alt="Institute Logo"/>
          <h1>${settings?.name || "Training Institute"}</h1>
          <p><em>Official Registration Record</em></p>
          <hr/>
        </header>

        <div class="student-info">
          <div>
            <p><strong>Name:</strong> ${registration.englishName}</p>
            <p><strong>Registration #:</strong> ${registration.registrationNumber || "N/A"}</p>
          </div>
          <div class="photo-container">
            <img src="${registration.photo || "/assets/images/placeholder.png"}" alt="Student Photo"/>
          </div>
        </div>

        <h2>Personal Information</h2>
        <table>
          <tr><th>Father's Name</th><td>${registration.fathersName || "N/A"}</td></tr>
          <tr><th>Mother's Name</th><td>${registration.mothersName || "N/A"}</td></tr>
          <tr><th>Email</th><td>${registration.email || "N/A"}</td></tr>
          <tr><th>Phone</th><td>${registration.number || "N/A"}</td></tr>
          <tr><th>Occupation</th><td>${registration.occupation || "N/A"}</td></tr>
          <tr><th>Institution</th><td>${registration.institution || "N/A"}</td></tr>
        </table>

        <h2>Course Information</h2>
        <table>
          <tr><th>Course</th><td>${course?.title || "N/A"}</td></tr>
          <tr><th>Price</th><td>${course?.discountPrice ? course.discountPrice + " (Discounted)" : course?.price || "N/A"}</td></tr>
          <tr><th>Start Date</th><td>${course?.courseStartDate || "TBA"}</td></tr>
          <tr><th>Duration</th><td>${course?.duration || "N/A"}</td></tr>
          <tr><th>Sessions</th><td>${course?.sessions || "N/A"}</td></tr>
          <tr><th>Seats</th><td>${Number(course?.seats) || "0"}</td></tr>
          <tr><th>Registration Deadline</th><td>${course?.registrationDeadline || "Not specified"}</td></tr>
        </table>

        <footer>
          Generated on ${new Date().toLocaleDateString()} by ${settings?.name || "Training Institute"}.<br/>
          Contact: ${settings?.email || "info@example.com"} | ${settings?.phoneNumber || "N/A"}<br/>
        </footer>
      </body>
    </html>
  `);

    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };

  return (
    <main className="w-full py-10 px-6 md:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10 items-start">
        {/* Left Column */}
        <section>
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {registration.englishName || "Unnamed Student"}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Registration #:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {registration.registrationNumber || "N/A"}
                </span>
              </span>

              {/* Action Buttons */}
              <div className="ml-auto">
                <button
                  onClick={() => {
                    handlePrint();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          </motion.header>

          {/* Photo + Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                <Image
                  src={registration.photo || "/assets/images/placeholder.png"}
                  alt={registration.englishName || "Student Photo"}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 text-center md:text-left">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {registration.englishName || "Unnamed Student"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  {registration.email || "No email provided"}
                </p>

                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                  <StatusBadge
                    color="blue"
                    label={registration.status || "Pending"}
                  />
                  <StatusBadge
                    color="purple"
                    label={registration.certificateStatus || "Not Certified"}
                  />
                  <StatusBadge
                    color={
                      registration.paymentStatus === "Paid" ? "green" : "red"
                    }
                    label={
                      registration.paymentStatus
                        ? registration.paymentAmount
                          ? `${registration.paymentStatus} (৳ ${registration.paymentAmount})`
                          : registration.paymentStatus
                        : "Unpaid"
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Compact Info (no notes) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Quick Info
              </h4>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <KeyValue
                  label="Occupation"
                  value={registration.occupation || "N/A"}
                />
                <KeyValue
                  label="Institution"
                  value={registration.institution || "N/A"}
                />
                <KeyValue
                  label="Father's Name"
                  value={registration.fathersName || "N/A"}
                />
                <KeyValue
                  label="Mother's Name"
                  value={registration.mothersName || "N/A"}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex-1 col-span-2"
            >
              <InfoCard title="Personal Info" icon={<User size={18} />}>
                <InfoItem icon={<User size={18} />} label="Father's Name">
                  {registration.fathersName || "N/A"}
                </InfoItem>

                <InfoItem icon={<User size={18} />} label="Mother's Name">
                  {registration.mothersName || "N/A"}
                </InfoItem>

                <InfoItem icon={<Mail size={18} />} label="Email">
                  {registration.email || "N/A"}
                </InfoItem>

                <InfoItem icon={<Phone size={18} />} label="Phone">
                  {registration.number || "N/A"}
                </InfoItem>

                <InfoItem icon={<Clipboard size={18} />} label="Address">
                  {registration.address || "N/A"}
                </InfoItem>

                <InfoItem icon={<User size={18} />} label="Occupation">
                  {registration.occupation || "N/A"}
                </InfoItem>

                <InfoItem icon={<User size={18} />} label="Institution">
                  {registration.institution || "N/A"}
                </InfoItem>
              </InfoCard>
            </motion.div>
          </div>
        </section>

        {/* Right Column: Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <InfoCard title="Course Details" icon={<GraduationCap size={18} />}>
            <InfoItem icon={<GraduationCap size={18} />} label="Course">
              {course?.title || "N/A"}
            </InfoItem>

            <InfoItem icon={<DollarSign size={18} />} label="Price">
              {course?.discountPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 line-through">
                    টাকা {course.price}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-green-50 text-green-800 font-semibold text-sm">
                    টাকা {course.discountPrice}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-gray-900">
                  টাকা {course?.price || "N/A"}
                </span>
              )}
            </InfoItem>

            <InfoItem icon={<CalendarDays size={18} />} label="Start Date">
              {course?.courseStartDate || "TBA"}
            </InfoItem>

            <InfoItem icon={<Clock size={18} />} label="Duration">
              {course?.duration || "N/A"}
            </InfoItem>

            <InfoItem icon={<BookOpen size={18} />} label="Sessions">
              {course?.sessions || "N/A"}
            </InfoItem>

            <InfoItem icon={<Users size={18} />} label="Seats">
              {Number(course?.seats) > 0
                ? `${Number(course?.seats)} available`
                : "No seats left"}
            </InfoItem>

            <InfoItem
              icon={<AlertCircle size={18} />}
              label="Registration Deadline"
            >
              {course?.registrationDeadline || "Not specified"}
            </InfoItem>
          </InfoCard>
        </aside>
      </div>
    </main>
  );
}

/* ---------------- Reusable Components ---------------- */

function InfoCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {icon ? <div className="text-gray-400">{icon}</div> : null}
      </div>

      <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800 pt-1">
        {children}
      </div>
    </motion.div>
  );
}

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
    <div className="py-3">
      <div className="grid grid-cols-[28px,1fr,auto] items-start gap-3">
        <div className="text-gray-500 dark:text-gray-400 mt-1">{icon}</div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {label}:
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {children}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400"></div>
      </div>
    </div>
  );
}

function StatusBadge({
  color,
  label,
}: {
  color: "blue" | "green" | "red" | "purple";
  label: string;
}) {
  const base = "px-3 py-1 rounded-full text-sm font-medium";
  const styles: Record<string, string> = {
    blue: `${base} bg-blue-50 text-blue-700`,
    green: `${base} bg-green-50 text-green-700`,
    red: `${base} bg-red-50 text-red-700`,
    purple: `${base} bg-purple-50 text-purple-700`,
  };
  return <span className={styles[color]}>{label}</span>;
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-1">
        {value}
      </div>
    </div>
  );
}
