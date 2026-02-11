"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  if (!interactive) {
    return (
      <div className={`flex items-center gap-0.5 ${className}`}>
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(displayValue)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="p-0.5 -ml-0.5 focus:outline-none"
        >
          <Star
            size={size}
            className={`${
              star <= displayValue
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            } transition-colors duration-200`}
          />
        </motion.button>
      ))}
      {interactive && (
        <span className="ml-2 text-xs font-medium text-[var(--color-text-secondary)]">
          {displayValue}/{max}
        </span>
      )}
    </div>
  );
}
