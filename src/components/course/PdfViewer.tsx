"use client";

import {
  getAssetExtension,
  resolveDocumentLessonUrl,
} from "@/lib/lesson-assets";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";
import { Download, ExternalLink, FileText } from "lucide-react";

interface PdfViewerProps {
  url: string;
  originalUrl?: string;
}

export function PdfViewer({ url, originalUrl }: PdfViewerProps) {
  const { language } = useLanguage();
  const previewSrc = resolveDocumentLessonUrl(url);
  const sourceDocumentUrl = originalUrl || url;
  const sourceDocumentSrc = resolveDocumentLessonUrl(sourceDocumentUrl);
  const extension = getAssetExtension(sourceDocumentUrl);
  const previewExtension = getAssetExtension(url);
  const isPdf = extension === "pdf";
  const canInlinePreview = previewExtension === "pdf";
  const documentLabel =
    extension === "docx"
      ? "DOCX"
      : extension === "doc"
        ? "DOC"
        : "PDF";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              {documentLabel}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {isPdf
                ? language === "vi"
                  ? "Xem tài liệu trực tiếp trong LMS hoặc mở tab mới khi cần."
                  : "Read the document inline or open it in a separate tab when needed."
                : language === "vi"
                  ? "Tài liệu Office sẽ mở bằng route local và có thể tải về hoặc mở tab mới."
                  : "Office documents open from the local route and can be downloaded or opened in a new tab."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sourceDocumentSrc && (
            <>
              <Button
                href={sourceDocumentSrc}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="justify-center gap-2"
              >
                <ExternalLink size={16} />
                {language === "vi" ? "Mở tab mới" : "Open in new tab"}
              </Button>
              {!isPdf && (
                <Button
                  href={sourceDocumentSrc}
                  download
                  variant="outline"
                  className="justify-center gap-2"
                >
                  <Download size={16} />
                  {language === "vi" ? "Tải xuống" : "Download"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {canInlinePreview ? (
        <div
          className="w-full overflow-hidden bg-[var(--color-bg)]"
          style={{ height: "72vh" }}
        >
          <iframe src={previewSrc} className="h-full w-full" title="PDF Viewer" />
        </div>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center bg-[var(--color-bg-alt)]/35 p-8 text-center">
          <div className="max-w-md space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-accent/10 text-accent">
              <FileText size={22} />
            </div>
            <p className="text-base font-semibold">
              {language === "vi"
                ? "Tài liệu Office sẵn sàng"
                : "Office document ready"}
            </p>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              {language === "vi"
                ? "Trình duyệt không render DOC/DOCX trực tiếp như PDF. Bạn có thể mở tab mới hoặc tải về từ local storage của dự án."
                : "Browsers do not render DOC/DOCX inline like PDFs. Open the file in a new tab or download it from the project local storage route."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
