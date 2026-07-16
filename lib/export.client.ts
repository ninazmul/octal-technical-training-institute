"use client";

import jsPDF from "jspdf";

export type ExportColumn<T> = {
  header: string;
  value: (item: T) => string | number | null | undefined;
};

function formatExportValue(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

function downloadBlob(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  fileName: string,
) {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [
    columns.map((column) => escapeCell(column.header)).join(","),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCell(formatExportValue(column.value(row))))
        .join(","),
    ),
  ].join("\n");

  downloadBlob(csv, fileName, "text/csv;charset=utf-8;");
}

export function exportRowsToPdf<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 32;
  const columnWidth = (pageWidth - margin * 2) / columns.length;
  let y = margin;

  const addHeader = () => {
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 24;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    columns.forEach((column, index) => {
      doc.text(column.header, margin + index * columnWidth, y, {
        maxWidth: columnWidth - 6,
      });
    });
    doc.setFont("helvetica", "normal");
    y += 16;
  };

  addHeader();

  rows.forEach((row) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }

    columns.forEach((column, index) => {
      doc.text(formatExportValue(column.value(row)), margin + index * columnWidth, y, {
        maxWidth: columnWidth - 6,
      });
    });
    y += 18;
  });

  doc.save(fileName);
}

export function getDateRangeMatch(
  value: string | Date | null | undefined,
  startDate: string,
  endDate: string,
) {
  if (!startDate && !endDate) return true;
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (date < start) return false;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }

  return true;
}
