"use client";

import { useState, FormEvent } from "react";
import { addFeedback } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface FeedbackFormProps {
  uid?: string;
}

export function FeedbackForm({ uid }: FeedbackFormProps) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const copy = useTranslations("feedback");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    try {
      await addFeedback({
        uid,
        message: message.trim(),
        rating: rating || undefined,
        page: "/app",
      });
      setStatus("sent");
      setMessage("");
      setRating(0);
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="font-medium text-emerald-600 dark:text-emerald-400">
          {copy.success.message}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm text-accent hover:underline"
        >
          {copy.success.cta}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          {copy.form.ratingLabel}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus-ring rounded-md p-0.5 transition-transform hover:scale-110"
              aria-label={copy.form.starAria.replace("{count}", String(star))}
            >
              <Star
                size={22}
                className={`transition-colors ${star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-[var(--color-border)]"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="feedback-msg" className="mb-2 block text-sm font-medium">
          {copy.form.messageLabel}
        </label>
        <textarea
          id="feedback-msg"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy.form.placeholder}
          className="focus-ring w-full resize-none rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--color-text-secondary)]/50"
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-500">
          {copy.form.error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={status === "sending"}
      >
        {status === "sending" ? copy.form.submit.sending : copy.form.submit.idle}
      </Button>
    </form>
  );
}
