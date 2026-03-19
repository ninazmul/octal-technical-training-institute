"use client";

import React, { useCallback, useState } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import { cn } from "@/lib/utils";
import { FiUpload, FiX, FiRefreshCw } from "react-icons/fi";

type PdfUploaderProps = {
  onFieldChange: (url: string) => void;
  fileUrl: string;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export function PdfUploader({
  onFieldChange,
  fileUrl,
  setFiles,
}: PdfUploaderProps) {
  const { startUpload } = useUploadThing("mediaUploader");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------- Upload Handler ----------
  const uploadFile = useCallback(
    async (selectedFile: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const fakeProgress = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 200);

        const res = await startUpload([selectedFile]);

        clearInterval(fakeProgress);
        setProgress(100);
        setIsUploading(false);

        if (res && res[0]?.url) {
          onFieldChange(res[0].url);
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        setIsUploading(false);
        setError("Upload failed. Try again.");
      }
    },
    [startUpload, onFieldChange], // ✅ critical dependencies
  );

  // ---------- Drop ----------
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      if (selectedFile.size > 4 * 1024 * 1024) {
        setError("File must be under 4MB.");
        return;
      }

      setFiles([selectedFile]);
      setFile(selectedFile);
      setFileName(selectedFile.name);

      await uploadFile(selectedFile);
    },
    [setFiles, uploadFile], // now stable
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: generateClientDropzoneAccept(["application/pdf"]),
  });

  // ---------- Actions ----------
  const handleRemove = () => {
    setFile(null);
    setFileName(null);
    setProgress(0);
    setError(null);
    onFieldChange("");
    setFiles([]);
  };

  const handleRetry = () => {
    if (file) uploadFile(file);
  };

  return (
    <div className="w-full space-y-2">
      <div {...getRootProps()} className="w-full">
        <input {...getInputProps()} className="hidden" />

        <div
          className={cn(
            "flex items-center justify-between h-12 w-full rounded-md border px-3 text-sm cursor-pointer transition",
            isUploading && "border-primary-400 bg-primary-50",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <FiUpload className="text-gray-400" />

            {isUploading ? (
              <span className="text-primary-600">Uploading... {progress}%</span>
            ) : fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline truncate"
              >
                {fileName || "View PDF"}
              </a>
            ) : (
              <span className="text-gray-400">Click or drag PDF here</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {error && (
              <FiRefreshCw
                onClick={handleRetry}
                className="cursor-pointer text-red-500"
                title="Retry"
              />
            )}

            {(fileUrl || file) && !isUploading && (
              <FiX
                onClick={handleRemove}
                className="cursor-pointer text-gray-500 hover:text-red-500"
                title="Remove"
              />
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-primary-500 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
