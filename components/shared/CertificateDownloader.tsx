"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Eye } from "lucide-react";
import CertificateTemplate from "./CertificateTemplate";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { ISettingSafe } from "@/lib/database/models/setting.model";

export default function CertificateDownloader({
  registration,
  course,
  settings,
}: {
  registration: SerializedRegistration;
  course: ICourseSafe | null;
  settings: ISettingSafe | null;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);

  // ✅ Dynamic scaling
  useEffect(() => {
    const updateScale = () => {
      const certWidth = 320 * 3.78;
      const certHeight = 210 * 3.78;

      const padding = 40;

      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - padding;

      const scaleX = availableWidth / certWidth;
      const scaleY = availableHeight / certHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleDownload = async () => {
    if (!downloadRef.current) return;

    setLoading(true);

    const canvas = await html2canvas(downloadRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    // Convert to image (no text layer)
    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    // Create PDF with only the image
    const pdf = new jsPDF("l", "mm", [210, 320]);

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 320;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // Disable metadata that might allow editing
    pdf.setProperties({
      title: "Certificate",
      subject: "Locked certificate",
      author: "Your Organization",
      keywords: "certificate, image-only",
      creator: "CertificateDownloader",
    });

    pdf.save(
      `certificate_${registration.englishName || registration.registrationNumber}.pdf`,
    );

    setLoading(false);
  };

  return (
    <div>
      {/* Button */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md"
      >
        <Eye className="w-4 h-4" /> Preview Certificate
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          {/* Close */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white text-xl"
          >
            ✕
          </button>

          {/* Certificate */}
          <div className="w-full h-full flex items-center justify-center">
            <div
              ref={previewRef}
              style={{
                width: "320mm",
                height: "210mm",
                transform: `scale(${scale})`,
                transformOrigin: "center",
                boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
                paddingBottom: "5mm", // ✅ safeguard against cropping
              }}
            >
              <CertificateTemplate
                registration={registration}
                course={course}
                settings={settings}
              />
            </div>
          </div>

          {/* Download */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-white rounded-md shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download /> {loading ? "Generating..." : "Download"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Render for PDF */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
        <div
          ref={downloadRef}
          style={{
            width: "320mm",
            height: "210mm",
            background: "#ffffff",
            paddingBottom: "5mm", // ✅ safeguard against cropping
          }}
        >
          <CertificateTemplate
            registration={registration}
            course={course}
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}
