"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle } from "lucide-react";

interface FileUploaderProps {
  accept?: string;
  onUpload: (file: File) => Promise<string>;
  currentUrl?: string;
  label?: string;
}

export function FileUploader({
  accept,
  onUpload,
  currentUrl,
  label = "Upload file",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(currentUrl || "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    setProgress(0);
    try {
      const downloadUrl = await onUpload(file);
      setUrl(downloadUrl);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block typo-caption font-semibold">{label}</label>

      {url ? (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/5">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span className="typo-caption text-green-600 truncate flex-1">
            Uploaded successfully
          </span>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-[var(--color-text-secondary)] hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-accent/50 cursor-pointer transition-colors"
        >
          <Upload size={20} className="text-[var(--color-text-secondary)]" />
          <span className="typo-body text-[var(--color-text-secondary)]">
            {uploading ? `Uploading... ${progress}%` : "Click to upload"}
          </span>
        </div>
      )}

      {uploading && (
        <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="typo-caption text-red-500">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
