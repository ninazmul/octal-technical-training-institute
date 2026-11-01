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

const CERT_WIDTH = 1123;
const CERT_HEIGHT = 794;

function rankLabel(rank: number) {
  if (rank === 1) return "1st Place";
  if (rank === 2) return "2nd Place";
  if (rank === 3) return "3rd Place";
  return `Rank #${rank}`;
}

/**
 * Printable landscape A4 certificate (1123×794 px @ 96dpi).
 *
 * Layout uses absolute positioning only (no flexbox / grid / gap) because
 * html2canvas rasterises flex layouts incorrectly, which shifts text inside the
 * exported PDF even though the live preview looks correct.
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
      style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}
    >
      {/* Decorative frame */}
      <div className="absolute inset-0 border-[14px] border-primary" />
      <div className="absolute inset-[24px] border border-primary/30" />

      {/* Corner accents */}
      <div
        className="absolute w-16 h-16 border-t-4 border-l-4 border-amber-400"
        style={{ top: 34, left: 34 }}
      />
      <div
        className="absolute w-16 h-16 border-t-4 border-r-4 border-amber-400"
        style={{ top: 34, left: CERT_WIDTH - 34 - 64 }}
      />
      <div
        className="absolute w-16 h-16 border-b-4 border-l-4 border-amber-400"
        style={{ top: CERT_HEIGHT - 34 - 64, left: 34 }}
      />
      <div
        className="absolute w-16 h-16 border-b-4 border-r-4 border-amber-400"
        style={{ top: CERT_HEIGHT - 34 - 64, left: CERT_WIDTH - 34 - 64 }}
      />

      {/* Watermark logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: (CERT_HEIGHT - 420) / 2,
          left: (CERT_WIDTH - 420) / 2,
          width: 420,
          height: 420,
          opacity: 0.03,
        }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="Watermark"
          width={420}
          height={420}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>

      {/* Organizer logo + name */}
      <div
        style={{
          position: "absolute",
          top: 84,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
        }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="Organizer logo"
          width={52}
          height={52}
          className="inline-block align-middle object-contain"
          unoptimized
        />
        <span className="inline-block align-middle ml-3 text-[13px] tracking-[0.34em] uppercase text-gray-500 font-sans">
          {data.organizer}
        </span>
      </div>

      {/* Title */}
      <div
        className="text-[52px] leading-none font-bold text-primary tracking-wide"
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
        }}
      >
        Certificate of Achievement
      </div>

      {/* Category */}
      <div
        className="text-[12px] tracking-[0.4em] uppercase text-gray-400 font-sans"
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
        }}
      >
        Olympiad {data.category}
      </div>

      {/* Award pill (winners) */}
      {isWinner && (
        <div
          style={{
            position: "absolute",
            top: 252,
            left: 0,
            width: CERT_WIDTH,
            textAlign: "center",
          }}
        >
          <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-amber-700">
            <Award className="inline-block align-middle w-4 h-4 mr-2" />
            <span className="inline-block align-middle text-[13px] font-sans font-semibold uppercase tracking-widest">
              {rankLabel(data.rank)}
            </span>
          </span>
        </div>
      )}

      {/* Divider */}
      <div
        className="absolute h-[3px] bg-primary/30"
        style={{ top: 312, left: (CERT_WIDTH - 160) / 2, width: 160 }}
      />

      {/* Presented to */}
      <div
        className="text-[15px] text-gray-500 font-sans"
        style={{
          position: "absolute",
          top: 348,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
        }}
      >
        This certificate is proudly presented to
      </div>

      {/* Student name */}
      <div
        className="text-[42px] leading-tight font-bold text-gray-900"
        style={{
          position: "absolute",
          top: 378,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
        }}
      >
        {data.studentName}
      </div>

      {/* Name underline */}
      <div
        className="absolute h-[1px] bg-gray-300"
        style={{ top: 442, left: (CERT_WIDTH - 320) / 2, width: 320 }}
      />

      {/* Description */}
      <div
        className="text-[17px] leading-relaxed text-gray-700 font-sans"
        style={{
          position: "absolute",
          top: 466,
          left: (CERT_WIDTH - 760) / 2,
          width: 760,
          textAlign: "center",
        }}
      >
        for outstanding performance in{" "}
        <span className="font-semibold text-primary">
          {data.olympiadTitle}
        </span>
        , securing{" "}
        <span className="font-semibold text-gray-900">
          {rankLabel(data.rank)}
        </span>{" "}
        with a score of{" "}
        <span className="font-semibold text-gray-900">
          {data.totalScore}/{data.maxScore}
        </span>{" "}
        ({data.percentage}%).
      </div>

      {/* Signatures */}
      <div
        className="text-[13px] font-sans text-gray-600"
        style={{
          position: "absolute",
          top: 622,
          left: 232,
          width: 260,
          textAlign: "center",
          borderTop: "1px solid #9ca3af",
          paddingTop: 8,
        }}
      >
        Issued on {data.issuedAt}
      </div>
      <div
        className="text-[13px] font-sans text-gray-600"
        style={{
          position: "absolute",
          top: 622,
          left: 631,
          width: 260,
          textAlign: "center",
          borderTop: "1px solid #9ca3af",
          paddingTop: 8,
        }}
      >
        Authorized Signature
      </div>

      {/* Registration number */}
      {data.registrationNumber && (
        <div
          className="text-[11px] text-gray-400 font-mono"
          style={{
            position: "absolute",
            top: 704,
            left: 0,
            width: CERT_WIDTH,
            textAlign: "center",
          }}
        >
          Registration No: {data.registrationNumber}
        </div>
      )}
    </div>
  );
}
