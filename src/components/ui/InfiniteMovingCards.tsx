"use client";

import { useEffect, useRef, useState } from "react";

interface Item {
  quote: string;
  name: string;
  title: string;
}

interface InfiniteMovingCardsProps {
  items: Item[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  className?: string;
}

const speeds = { slow: "60s", normal: "40s", fast: "20s" };

export function InfiniteMovingCards({
  items,
  speed = "normal",
  direction = "left",
  className = "",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!scrollerRef.current || !containerRef.current) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      const dup = item.cloneNode(true);
      scrollerRef.current?.appendChild(dup);
    });

    containerRef.current.style.setProperty("--animation-duration", speeds[speed]);
    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse"
    );
    setStart(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={`scrollbar-hide relative z-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] ${className}`}
    >
      <ul
        ref={scrollerRef}
        className={`flex w-max shrink-0 gap-4 py-4 ${start ? "animate-[scroll_var(--animation-duration)_linear_infinite_var(--animation-direction)]" : ""
          }`}
        style={
          {
            "--animation-direction": "forwards",
          } as React.CSSProperties
        }
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="glass-card w-[300px] shrink-0 rounded-2xl px-6 py-5 sm:w-[350px]"
          >
            <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              &ldquo;{item.quote}&rdquo;
            </p>
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {item.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
