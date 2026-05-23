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
        src={settings?.certificate || "/assets/images/certificate.png"}
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
      <div className="absolute top-[100mm] text-center w-full px-[20mm]">
        <span className="text-[36px] truncate block pb-[4mm] w-[120mm] font-bold mx-auto">
          {registration.englishName}
        </span>
      </div>

      {/* Info Grid */}
      <div className="absolute top-[124mm] left-[73mm] w-[200mm] text-[16px] font-sans text-center">
        Successfully completed the course{" "}
        <span className="text-primary font-semibold">{course?.title}</span> with
        registration number{" "}
        <span className="text-primary font-semibold">
          {registration.registrationNumber}
        </span>
        . Issued on{" "}
        {new Date(registration.certificateIssuedAt || "").toLocaleDateString()}.
      </div>

      {/* QR Code */}
      <div className="absolute top-[156mm] left-[28mm]">
        <QRCode
          url={`${process.env.NEXT_PUBLIC_SERVER_URL}/verify/${registration.registrationNumber}`}
        />
      </div>
    </div>
  );
}
