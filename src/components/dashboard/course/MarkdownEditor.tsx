"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  Bold,
  Code2,
  Eye,
  EyeOff,
  Heading1,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  LoaderCircle,
  Quote,
  SquareSplitHorizontal,
} from "lucide-react";

type EditorMode = "write" | "split" | "preview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  storageKey?: string;
  assetScope?: string;
}

interface ToolbarAction {
  label: string;
  icon: React.ReactNode;
  apply: (selectedText: string) => {
    text: string;
    selectionStartOffset?: number;
    selectionEndOffset?: number;
  };
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: "Heading",
    icon: <Heading1 size={14} />,
    apply: (selectedText) => ({
      text: `# ${selectedText || "Heading"}`,
      selectionStartOffset: 2,
      selectionEndOffset: 0,
    }),
  },
  {
    label: "Bold",
    icon: <Bold size={14} />,
    apply: (selectedText) => ({
      text: `**${selectedText || "bold text"}**`,
      selectionStartOffset: 2,
      selectionEndOffset: 2,
    }),
  },
  {
    label: "Italic",
    icon: <Italic size={14} />,
    apply: (selectedText) => ({
      text: `*${selectedText || "italic text"}*`,
      selectionStartOffset: 1,
      selectionEndOffset: 1,
    }),
  },
  {
    label: "List",
    icon: <List size={14} />,
    apply: (selectedText) => ({
      text: selectedText
        ? selectedText
            .split("\n")
            .map((line) => `- ${line}`)
            .join("\n")
        : "- List item",
      selectionStartOffset: 2,
      selectionEndOffset: 0,
    }),
  },
  {
    label: "Quote",
    icon: <Quote size={14} />,
    apply: (selectedText) => ({
      text: selectedText
        ? selectedText
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")
        : "> Quote",
      selectionStartOffset: 2,
      selectionEndOffset: 0,
    }),
  },
  {
    label: "Code",
    icon: <Code2 size={14} />,
    apply: (selectedText) => ({
      text: selectedText
        ? `\`\`\`\n${selectedText}\n\`\`\``
        : "```\ncode block\n```",
      selectionStartOffset: 4,
      selectionEndOffset: 4,
    }),
  },
  {
    label: "Link",
    icon: <LinkIcon size={14} />,
    apply: (selectedText) => ({
      text: `[${selectedText || "Link text"}](https://example.com)`,
      selectionStartOffset: 1,
      selectionEndOffset: 22,
    }),
  },
];

function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "# Title\n\nStart writing...",
  storageKey,
  assetScope,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("split");
  const [restoreDraftValue, setRestoreDraftValue] = useState<string | null>(null);
  const [draftDecisionPending, setDraftDecisionPending] = useState(false);
  const [autosaveLabel, setAutosaveLabel] = useState(
    storageKey ? "Local draft ready" : "Autosave off"
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const initialValueRef = useRef(value);
  const html = useMemo(() => renderMarkdown(value), [value]);

  const commitValue = (nextValue: string) => {
    onChange(nextValue);
    if (storageKey) {
      setAutosaveLabel("Saving draft...");
    }
  };

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    const rawDraft = window.localStorage.getItem(storageKey);
    if (!rawDraft) return;

    try {
      const parsed = JSON.parse(rawDraft) as { value?: string };
      if (parsed.value && parsed.value !== initialValueRef.current) {
        setRestoreDraftValue(parsed.value);
        setDraftDecisionPending(true);
        setAutosaveLabel("Draft found locally");
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined" || draftDecisionPending) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ value, savedAt: Date.now() })
      );
      setAutosaveLabel("Autosaved locally");
    }, 450);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value, storageKey, draftDecisionPending]);

  const applyAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const next = action.apply(selectedText);
    const nextValue = `${before}${next.text}${after}`;
    const selectionStartOffset = next.selectionStartOffset ?? 0;
    const selectionEndOffset = next.selectionEndOffset ?? 0;

    commitValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + selectionStartOffset,
        selectionStart + next.text.length - selectionEndOffset
      );
    });
  };

  const restoreDraft = () => {
    if (!restoreDraftValue) return;
    commitValue(restoreDraftValue);
    setDraftDecisionPending(false);
    setRestoreDraftValue(null);
  };

  const dismissDraft = () => {
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setDraftDecisionPending(false);
    setRestoreDraftValue(null);
    setAutosaveLabel(storageKey ? "Local draft ready" : "Autosave off");
  };

  const handleImageUpload = async (file?: File) => {
    if (!file || !assetScope) return;

    setUploadingImage(true);
    setImageUploadError("");

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", assetScope);
      formData.append("kind", "content-image");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Image upload failed");
      }

      const textarea = textareaRef.current;
      if (!textarea) {
        commitValue(`${value}\n\n![${file.name}](${payload.url})`);
        return;
      }

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      const markdownImage = `![${file.name}](${payload.url})`;
      commitValue(`${before}${markdownImage}${after}`);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = selectionStart + markdownImage.length;
        textarea.setSelectionRange(cursor, cursor);
      });
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : "Image upload failed"
      );
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const modeButtonClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "bg-accent/10 text-accent"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
    }`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Markdown Studio
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Viết nội dung lesson với toolbar nhanh, preview realtime và autosave local.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={modeButtonClass(mode === "write")}
            >
              <EyeOff size={14} />
              Write
            </button>
            <button
              type="button"
              onClick={() => setMode("split")}
              className={modeButtonClass(mode === "split")}
            >
              <SquareSplitHorizontal size={14} />
              Split
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={modeButtonClass(mode === "preview")}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>
        </div>

        {restoreDraftValue && draftDecisionPending && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tìm thấy draft cục bộ chưa lưu cho lesson này. Bạn muốn khôi phục không?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={dismissDraft}
                className="rounded-full border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-300"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Khôi phục
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => applyAction(action)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={!assetScope || uploadingImage}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadingImage ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <ImagePlus size={14} />
            )}
            {uploadingImage ? "Uploading..." : "Image"}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImageUpload(event.target.files?.[0])}
          />
        </div>

        {imageUploadError && (
          <p className="text-xs text-red-500">{imageUploadError}</p>
        )}
        {!assetScope && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Save or identify the course draft first to upload lesson images.
          </p>
        )}
      </div>

      <div className={`grid ${mode === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {mode !== "preview" && (
          <div className={`${mode === "split" ? "lg:border-r" : ""} border-[var(--color-border)]`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => commitValue(event.target.value)}
              placeholder={placeholder}
              className="h-[380px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-7 outline-none"
            />
          </div>
        )}

        {mode !== "write" && (
          <div className="min-h-[380px] bg-[var(--color-bg-alt)]/25">
            <div
              className="prose prose-lg dark:prose-invert max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: html || "<p>Nothing to preview yet.</p>" }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
        <span>{countWords(value)} words • {autosaveLabel}</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
