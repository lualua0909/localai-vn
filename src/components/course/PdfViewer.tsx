"use client";

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: "70vh" }}>
      <iframe
        src={url}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  );
}
