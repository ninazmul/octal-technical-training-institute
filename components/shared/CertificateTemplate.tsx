"use client";

import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import Image from "next/image";
import QRCode from "./QrCode";

type CertificateTemplateProps = {
  registration: SerializedRegistration;
  course: ICourseSafe | null;
  settings: ISettingSafe | null;
};

export default function CertificateTemplate({
  registration,
  course,
  settings,
}: CertificateTemplateProps) {
  const themeColor = settings?.theme || "#0055CE";

  const modules = course?.modules || [];

  return (
    <div
      className="relative font-serif w-[320mm] h-[210mm] bg-white p-[4mm]"
      style={{
        minWidth: "320mm",
        minHeight: "210mm",
      }}
    >
      {/* Background */}
      <Image
        src="/assets/images/certificate.png"
        alt="Certificate Background"
        fill
        className="object-cover"
        priority
        unoptimized
      />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Image
          src="/assets/images/logo.png"
          alt="Watermark"
          width={350}
          height={350}
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Student Name */}
      <div className="absolute top-[58mm] left-[73mm] w-[120mm] border-b border-gray-700">
        <span className="text-[32px] truncate block pb-[2mm] w-[120mm]">
          {registration.englishName}
        </span>
      </div>

      {/* Course Title */}
      <div className="absolute top-[78mm] left-[73mm] w-[200mm]">
        <p className="uppercase text-[18px] font-sans">
          Completion of instructor-led training on
        </p>
        <h3
          className="text-[40px] font-bold uppercase truncate pb-[2mm]"
          style={{ color: themeColor }}
        >
          {course?.title || "N/A"}
        </h3>
      </div>

      {/* Info Grid */}
      <div className="absolute top-[105mm] left-[73mm] w-[200mm] grid grid-cols-2 gap-x-6 gap-y-3 text-[16px] font-sans uppercase">
        {[
          { label: "Student ID", value: registration.registrationNumber },
          {
            label: "Certification",
            value: course?.certification || "OTTI Certificate",
          },
          {
            label: "Issue Date",
            value: registration.createdAt
              ? new Date(registration.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
          },
          { label: "Duration", value: course?.duration || "3 Months" },
        ].map((item, idx) => (
          <div key={idx} className="grid grid-cols-[150px_1fr] items-center">
            <span>{item.label}:</span>
            <div className="border-b border-gray-600 w-[180px] px-2 pb-[1.5mm]">
              <span className="truncate block pb-[1mm]">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div className="absolute top-[128mm] left-[73mm] w-[200mm] pb-[2mm]">
        <p className="text-[18px] font-bold font-sans mb-2">Topics Covered</p>
        <div className="grid grid-cols-2 gap-x-6">
          {/* First column: show first 4 topics */}
          <ul className="text-[16px] leading-tight font-light font-sans space-y-1">
            {modules.slice(0, 4).map((item, idx) => (
              <li key={idx} className="truncate pb-[1mm]">
                - {item.title}
              </li>
            ))}
          </ul>

          {/* Second column: show next 4 topics, then "+X more topics" if extras exist */}
          <ul className="text-[16px] leading-tight font-light font-sans space-y-1">
            {modules.slice(4, 8).map((item, idx) => (
              <li key={idx} className="truncate pb-[1mm]">
                - {item.title}
              </li>
            ))}
            {modules.length > 8 && (
              <li className="italic text-gray-600">
                +{modules.length - 8} more topics
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* QR Code */}
      <div className="absolute top-[152mm] left-[30mm]">
        <QRCode
          url={`${process.env.NEXT_PUBLIC_SERVER_URL}/verify/${registration.registrationNumber}`}
        />
      </div>
    </div>
  );
}
