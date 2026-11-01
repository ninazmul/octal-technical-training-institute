"use client";

import Image from "next/image";
import { Award } from "lucide-react";

export type OlympiadCertificateData = {
  studentName: string;
  olympiadTitle: string;
  category: string;
  organizer: string;
  rank: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  registrationNumber?: string;
  issuedAt: string;
};

function rankLabel(rank: number) {
  if (rank === 1) return "1st Place";
  if (rank === 2) return "2nd Place";
  if (rank === 3) return "3rd Place";
  return `Rank #${rank}`;
}

/**
 * Printable landscape A4 certificate (1123×794 px @ 96dpi). Pure CSS styling so
 * it rasterises cleanly through html2canvas for PDF export.
 */
export default function OlympiadCertificateTemplate({
  data,
}: {
  data: OlympiadCertificateData;
}) {
  const isWinner = data.rank <= 3;

  return (
    <div
      className="relative bg-white overflow-hidden font-serif"
      style={{ width: 1123, height: 794 }}
    >
      {/* Decorative frame */}
      <div className="absolute inset-0 border-[14px] border-primary" />
      <div className="absolute inset-[22px] border border-primary/30" />

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-amber-400" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-amber-400" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-amber-400" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-amber-400" />

      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Image
          src="/assets/images/logo.png"
          alt="Watermark"
          width={420}
          height={420}
          className="object-contain"
          unoptimized
        />
      </div>

      <div
        className="relative h-full flex flex-col items-center justify-center text-center"
        style={{ paddingLeft: 110, paddingRight: 110 }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/assets/images/logo.png"
            alt="Organizer logo"
            width={52}
            height={52}
            className="object-contain"
            unoptimized
          />
          <span className="text-[13px] tracking-[0.34em] uppercase text-gray-500 font-sans">
            {data.organizer}
          </span>
        </div>

        <h1 className="mt-5 text-[52px] leading-none font-bold text-primary tracking-wide">
          Certificate of Achievement
        </h1>
        <p className="mt-2 text-[12px] tracking-[0.4em] uppercase text-gray-400 font-sans">
          Olympiad {data.category}
        </p>

        {isWinner && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-amber-700">
            <Award className="w-4 h-4" />
            <span className="text-[13px] font-sans font-semibold uppercase tracking-widest">
              {rankLabel(data.rank)}
            </span>
          </div>
        )}

        <div className="mt-6 w-40 h-[3px] bg-primary/30" />

        <p className="mt-6 text-[15px] text-gray-500 font-sans">
          This certificate is proudly presented to
        </p>
        <h2 className="mt-3 text-[42px] leading-tight font-bold text-gray-900">
          {data.studentName}
        </h2>
        <div className="mt-2 w-80 h-[1px] bg-gray-300" />

        <p className="mt-6 max-w-[760px] text-[17px] leading-relaxed text-gray-700 font-sans">
          for outstanding performance in{" "}
          <span className="font-semibold text-primary">{data.olympiadTitle}</span>
          , securing{" "}
          <span className="font-semibold text-gray-900">
            {rankLabel(data.rank)}
          </span>{" "}
          with a score of{" "}
          <span className="font-semibold text-gray-900">
            {data.totalScore}/{data.maxScore}
          </span>{" "}
          ({data.percentage}%).
        </p>

        <div className="mt-14 flex w-full max-w-[720px] items-end justify-between text-[13px] font-sans">
          <div className="text-center">
            <div className="w-56 border-t border-gray-400 pt-1.5 text-gray-600">
              Issued on {data.issuedAt}
            </div>
          </div>
          <div className="text-center">
            <div className="w-56 border-t border-gray-400 pt-1.5 text-gray-600">
              Authorized Signature
            </div>
          </div>
        </div>

        {data.registrationNumber && (
          <p className="mt-6 text-[11px] text-gray-400 font-mono">
            Registration No: {data.registrationNumber}
          </p>
        )}
      </div>
    </div>
  );
}
