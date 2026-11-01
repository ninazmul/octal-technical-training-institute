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
      <img
        src="/assets/images/logo.png"
        alt="Watermark"
        style={{
          position: "absolute",
          top: (CERT_HEIGHT - 300) / 2,
          left: (CERT_WIDTH - 600) / 2,
          width: 600,
          height: 300,
          opacity: 0.04,
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />

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
        <div
          style={{
            display: "inline-block",
            position: "relative",
            height: 40,
            lineHeight: "40px",
          }}
        >
          <img
            src="/assets/images/logo.png"
            alt="Organizer logo"
            style={{
              height: 36,
              width: "auto",
              display: "inline-block",
              verticalAlign: "middle",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              display: "inline-block",
              marginLeft: 16,
              fontSize: 14,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#6b7280",
              fontFamily: "sans-serif",
              verticalAlign: "middle",
            }}
          >
            {data.organizer}
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
          fontSize: 56,
          lineHeight: "64px",
          fontWeight: "bold",
          color: "#0055CE",
          letterSpacing: "0.02em",
        }}
      >
        Certificate of Achievement
      </div>

      {/* Category */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
          fontSize: 13,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#9ca3af",
          fontFamily: "sans-serif",
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
          <div
            style={{
              display: "inline-block",
              borderRadius: 9999,
              border: "1px solid #fcd34d",
              backgroundColor: "#fffbeb",
              padding: "6px 20px",
              color: "#b45309",
              position: "relative",
              height: 32,
              lineHeight: "20px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                fontSize: 15,
                fontFamily: "sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              🏆 {rankLabel(data.rank)}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 312,
          left: (CERT_WIDTH - 160) / 2,
          width: 160,
          height: 3,
          backgroundColor: "rgba(0, 85, 206, 0.3)",
        }}
      />

      {/* Presented to */}
      <div
        style={{
          position: "absolute",
          top: 348,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
          fontSize: 16,
          color: "#6b7280",
          fontFamily: "sans-serif",
        }}
      >
        This certificate is proudly presented to
      </div>

      {/* Student name */}
      <div
        style={{
          position: "absolute",
          top: 378,
          left: 0,
          width: CERT_WIDTH,
          textAlign: "center",
          fontSize: 52,
          lineHeight: "64px",
          fontWeight: "bold",
          color: "#111827",
        }}
      >
        {data.studentName}
      </div>

      {/* Name underline */}
      <div
        style={{
          position: "absolute",
          top: 452,
          left: (CERT_WIDTH - 480) / 2,
          width: 480,
          height: 1,
          backgroundColor: "#d1d5db",
        }}
      />

      {/* Description */}
      <div
        style={{
          position: "absolute",
          top: 476,
          left: (CERT_WIDTH - 800) / 2,
          width: 800,
          textAlign: "center",
          fontSize: 18,
          lineHeight: "28px",
          color: "#374151",
          fontFamily: "sans-serif",
        }}
      >
        for outstanding performance in{" "}
        <span style={{ fontWeight: 600, color: "#0055CE" }}>
          {data.olympiadTitle}
        </span>
        , securing{" "}
        <span style={{ fontWeight: 600, color: "#111827" }}>
          {rankLabel(data.rank)}
        </span>{" "}
        with a score of{" "}
        <span style={{ fontWeight: 600, color: "#111827" }}>
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
