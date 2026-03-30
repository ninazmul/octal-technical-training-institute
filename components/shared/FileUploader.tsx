"use client";

import React, { useCallback, useState } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import { cn } from "@/lib/utils";
import { FiUpload, FiX, FiRefreshCw } from "react-icons/fi";
import Image from "next/image";

type FileUploaderProps = {
  onFieldChange: (
    uploadedUrl: string,
    rawFile?: File[],
  ) => Promise<void> | void;
  imageUrl: string;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export function FileUploader({
  onFieldChange,
  imageUrl,
  setFiles,
}: FileUploaderProps) {
  const { startUpload } = useUploadThing("mediaUploader");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
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
          onFieldChange(res[0].url, [selectedFile]);
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        setIsUploading(false);
        setError("Upload failed. Try again.");
      }
    },
    [startUpload, onFieldChange],
  );

  // ---------- Drop ----------
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      if (!selectedFile.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB.");
        return;
      }

      setFiles([selectedFile]);
      setFile(selectedFile);

      await uploadFile(selectedFile);
    },
    [setFiles, uploadFile],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: generateClientDropzoneAccept(["image/*"]),
  });

  // ---------- Actions ----------
  const handleRemove = () => {
    setFile(null);
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
            "relative w-full h-64 rounded-md border cursor-pointer overflow-hidden transition",
            isUploading && "border-primary-400 bg-primary-50",
          )}
        >
          {/* Uploading state */}
          {isUploading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white">
              <div className="w-12 h-12 mb-2 animate-spin rounded-full border-4 border-t-transparent border-white" />
              <p className="text-sm font-medium">Uploading... {progress}%</p>
            </div>
          )}

          {/* Full image preview */}
          {!isUploading && imageUrl ? (
            <div className="w-full h-full relative">
              <Image
                src={imageUrl}
                alt="Uploaded preview"
                fill
                className="object-contain bg-gray-50"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {error && (
                  <FiRefreshCw
                    onClick={handleRetry}
                    className="cursor-pointer text-red-500"
                    title="Retry"
                  />
                )}
                <FiX
                  onClick={handleRemove}
                  className="cursor-pointer text-gray-500 hover:text-red-500"
                  title="Remove"
                />
              </div>
            </div>
          ) : (
            // Upload UI
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FiUpload className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-sm font-medium">Click or drag image here</p>
              <p className="text-xs text-gray-400">
                PNG, JPG, JPEG, SVG (max 5MB)
              </p>
            </div>
          )}
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
