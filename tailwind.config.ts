import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-figtree)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        accent: {
          DEFAULT: "#0a84ff",
          hover: "#409cff",
        },
      },
      maxWidth: {
        container: "1180px",
      },
      fontSize: {
        "hero-desktop": ["clamp(3.5rem, 5vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "hero-mobile": ["clamp(2.5rem, 8vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "section-title": ["clamp(2rem, 3vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "beam-move": "beamMove 8s linear infinite",
        "cell-ripple":
          "cellRipple var(--duration, 600ms) ease-out var(--delay, 0ms) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        beamMove: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        cellRipple: {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
