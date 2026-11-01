"use client";

import Image from "next/image";
import { Award } from "lucide-react";

// Removed unused lucide-react Award import if not used elsewhere, 
// but keeping it for now if needed, though I'll use emoji for the badge.

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
        style={{
          position: "absolute",
          top: (CERT_HEIGHT - 400) / 2,
          left: (CERT_WIDTH - 800) / 2,
          width: 800,
          height: 400,
          opacity: 0.04,
          pointerEvents: "none",
        }}
      >
        <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "center", verticalAlign: "middle", padding: 0 }}>
                <img
                  src="/assets/images/logo.png"
                  alt="Watermark"
                  style={{
                    maxWidth: 700,
                    maxHeight: 350,
                    width: "auto",
                    height: "auto",
                    display: "inline-block",
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Organizer logo + name */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: CERT_WIDTH,
          height: 90,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <img
            src="/assets/images/logo.png"
            alt="Organizer logo"
            style={{
              height: 42,
              width: "auto",
              display: "inline-block",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#6b7280",
            fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {data.organizer}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          width: CERT_WIDTH,
          height: 70,
          textAlign: "center",
          fontSize: 54,
          lineHeight: "70px",
          fontWeight: "bold",
          color: "#0055CE",
          letterSpacing: "0.02em",
          fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
        }}
      >
        Certificate of Achievement
      </div>

      {/* Category */}
      <div
        style={{
          position: "absolute",
          top: 235,
          left: 0,
          width: CERT_WIDTH,
          height: 20,
          textAlign: "center",
          fontSize: 12,
          lineHeight: "20px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#9ca3af",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        Olympiad {data.category}
      </div>

      {/* Award Badge (winners) */}
      {isWinner && (
        <div
          style={{
            position: "absolute",
            top: 270,
            left: 0,
            width: CERT_WIDTH,
            height: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#b45309",
            }}
          >
            🏆 {rankLabel(data.rank)}
          </div>
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 325,
          left: (CERT_WIDTH - 160) / 2,
          width: 160,
          height: 3,
          backgroundColor: "rgba(0, 85, 206, 0.2)",
        }}
      />

      {/* Presented to */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          width: CERT_WIDTH,
          height: 24,
          textAlign: "center",
          fontSize: 16,
          lineHeight: "24px",
          color: "#6b7280",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        This certificate is proudly presented to
      </div>

      {/* Student name */}
      <div
        style={{
          position: "absolute",
          top: 395,
          left: 0,
          width: CERT_WIDTH,
          height: 60,
          textAlign: "center",
          fontSize: 48,
          lineHeight: "60px",
          fontWeight: "bold",
          color: "#111827",
          fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
        }}
      >
        {data.studentName}
      </div>

      {/* Name underline */}
      <div
        style={{
          position: "absolute",
          top: 465,
          left: (CERT_WIDTH - 400) / 2,
          width: 400,
          height: 1,
          backgroundColor: "#e5e7eb",
        }}
      />

      {/* Description */}
      <div
        style={{
          position: "absolute",
          top: 495,
          left: (CERT_WIDTH - 840) / 2,
          width: 840,
          height: 80,
          textAlign: "center",
          fontSize: 18,
          lineHeight: "28px",
          color: "#4b5563",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
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
