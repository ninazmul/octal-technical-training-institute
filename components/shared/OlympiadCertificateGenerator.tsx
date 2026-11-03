"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { Award, Download, FileDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OlympiadCertificateTemplate, {
  OlympiadCertificateData,
} from "./OlympiadCertificateTemplate";

type RankedAttempt = {
  _id: string;
  studentName: string;
  rank?: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  registrationId?: string;
};

type Props = {
  olympiad: any;
  attempts: RankedAttempt[];
  registrations: any[];
};

const CERT_WIDTH = 1123;
const CERT_HEIGHT = 794;
const PUBLIC_BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "https://octal.edu.bd").replace(/\/+$/, "");

export default function OlympiadCertificateGenerator({
  olympiad,
  attempts,
  registrations,
}: Props) {
  const [open, setOpen] = useState(false);
  const [topN, setTopN] = useState(10);
  const [activeIndex, setActiveIndex] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // Fit the preview inside whatever width the dialog column gives us.
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setPreviewScale(Math.min(1, width / CERT_WIDTH));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const ranked = useMemo(
    () =>
      attempts
        .filter((a) => a.rank)
        .sort((a, b) => (a.rank || 0) - (b.rank || 0)),
    [attempts],
  );

  const regNumberById = useMemo(() => {
    const map: Record<string, string> = {};
    registrations.forEach((r) => {
      map[String(r._id)] = r.registrationNumber;
    });
    return map;
  }, [registrations]);

  const maxSelectable = Math.max(ranked.length, 1);
  const effectiveTopN = Math.min(Math.max(topN, 1), maxSelectable);
  const recipients = ranked.slice(0, effectiveTopN);

  const issuedAt = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const buildData = (att: RankedAttempt): OlympiadCertificateData => ({
    studentName: att.studentName,
    olympiadTitle: olympiad.title,
    category: olympiad.category,
    organizer: olympiad.organizer || "Octal Technical Training Institute",
    rank: att.rank || 0,
    totalScore: att.totalScore,
    maxScore: att.maxScore,
    percentage: att.percentage,
    registrationNumber: att.registrationId
      ? regNumberById[String(att.registrationId)]
      : undefined,
    verificationUrl: `${PUBLIC_BASE_URL}/olympiads/${olympiad.slug}/verify?registration=${encodeURIComponent(regNumberById[String(att.registrationId)] || "")}`,
    issuedAt,
  });

  const renderNodeToPdfPage = async (node: HTMLElement) => {
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: CERT_WIDTH,
      height: CERT_HEIGHT,
      windowWidth: CERT_WIDTH,
      windowHeight: CERT_HEIGHT,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const handleDownloadOne = async (att: RankedAttempt) => {
    const node = hiddenRef.current?.querySelector<HTMLElement>(
      `[data-cert="${att._id}"]`,
    );
    if (!node) {
      toast.error("Certificate preview not ready yet.");
      return;
    }
    setBusyId(att._id);
    try {
      const img = await renderNodeToPdfPage(node);
      const pdf = new jsPDF("l", "mm", "a4");
      pdf.addImage(img, "JPEG", 0, 0, 297, 210);
      pdf.save(`certificate-rank${att.rank}-${att.studentName}.pdf`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate certificate.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!hiddenRef.current || recipients.length === 0) return;
    setIsExportingAll(true);
    try {
      const nodes = Array.from(
        hiddenRef.current.querySelectorAll<HTMLElement>("[data-cert]"),
      );
      const pdf = new jsPDF("l", "mm", "a4");
      for (let i = 0; i < nodes.length; i++) {
        const img = await renderNodeToPdfPage(nodes[i]);
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, 297, 210);
      }
      pdf.save(`${olympiad.slug}-certificates-top${recipients.length}.pdf`);
      toast.success(
        `Downloaded ${nodes.length} certificate(s) in one PDF.`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to generate certificates.");
    } finally {
      setIsExportingAll(false);
    }
  };

  const activeRecipient = recipients[activeIndex] || recipients[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={ranked.length === 0}
        className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          ranked.length === 0
            ? "Recalculate ranks first to award certificates"
            : "Generate winner certificates"
        }
      >
        <Award className="w-3.5 h-3.5" /> Certificates
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Generate Olympiad
              Certificates
            </DialogTitle>
            <DialogDescription>
              Award certificates to the top ranked participants. Choose how many
              recipients, preview them, then download individually or as a single
              multi-page PDF.
            </DialogDescription>
          </DialogHeader>

          {ranked.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No ranked participants yet. Recalculate ranks in the Leaderboard
              tab first.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recipient count controls */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold text-gray-700">
                  Number of recipients (Top N)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={maxSelectable}
                  value={topN}
                  onChange={(e) =>
                    setTopN(parseInt(e.target.value || "1", 10) || 1)
                  }
                  className="w-24"
                />
                <div className="flex items-center gap-1.5">
                  {[3, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTopN(n)}
                      className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
                    >
                      Top {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTopN(maxSelectable)}
                    className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
                  >
                    All ({ranked.length})
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {recipients.length} certificate
                  {recipients.length === 1 ? "" : "s"} will be generated
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {/* Recipient list */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
                    Recipients
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y">
                    {recipients.map((att, idx) => (
                      <div
                        key={att._id}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition cursor-pointer ${
                          idx === activeIndex ? "bg-primary/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {att.rank}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {att.studentName}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {att.totalScore}/{att.maxScore} • {att.percentage}%
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadOne(att);
                          }}
                          disabled={busyId === att._id}
                          aria-label={`Download certificate for ${att.studentName}`}
                          className="shrink-0 p-1.5 text-gray-500 hover:text-primary rounded hover:bg-white disabled:opacity-50"
                          title="Download this certificate"
                        >
                          {busyId === att._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg bg-gray-50 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-gray-600">
                      Preview — {activeRecipient?.studentName}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Landscape A4
                    </div>
                  </div>
                  <div ref={previewBoxRef} className="w-full flex justify-center">
                    {activeRecipient && (
                      <div
                        className="overflow-hidden rounded-md shadow-lg bg-white"
                        style={{
                          width: CERT_WIDTH * previewScale,
                          height: CERT_HEIGHT * previewScale,
                        }}
                      >
                        <div
                          style={{
                            width: CERT_WIDTH,
                            transform: `scale(${previewScale})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <OlympiadCertificateTemplate
                            data={buildData(activeRecipient)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExportingAll}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleDownloadAll}
              disabled={isExportingAll || recipients.length === 0}
              className="flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4" />
              {isExportingAll
                ? "Generating..."
                : `Download All (${recipients.length}) PDF`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Off-screen render targets used for PDF export */}
      {open && ranked.length > 0 && (
        <div
          ref={hiddenRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CERT_WIDTH,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: -1,
            opacity: 0,
          }}
          aria-hidden
        >
          {recipients.map((att) => (
            <div
              key={att._id}
              data-cert={att._id}
              style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}
            >
              <OlympiadCertificateTemplate data={buildData(att)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
