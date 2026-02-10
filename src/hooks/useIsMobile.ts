import { useEffect, useState } from "react";

type Options = {
  /**
   * A CSS media query string.
   * Defaults to Tailwind's `sm` breakpoint behavior: < 640px.
   */
  query?: string;
};

/**
 * Returns whether the current viewport matches a "mobile" media query.
 * - `null` before first client-side evaluation
 * - `true` when query matches
 * - `false` otherwise
 */
export function useIsMobile(options: Options = {}): boolean | null {
  const { query = "(max-width: 639px)" } = options;
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

