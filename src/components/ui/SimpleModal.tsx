import React, { useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
  actions
}: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl transition-all max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h3 className="text-lg font-semibold leading-6 text-[var(--color-text)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 px-6 py-4 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
