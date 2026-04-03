import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-figtree)", "sans-serif"],
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
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
        card: "0 4px 16px rgba(0, 0, 0, 0.06)",
        elevated: "0 12px 40px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "beam-move": "beamMove 8s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out both",
        "scale-in": "scaleIn 0.3s ease-out both",
        "typing-cursor": "typingCursor 1s steps(1) infinite",
        "progress-indeterminate": "progressIndeterminate 1.5s ease-in-out infinite",
        "dot-pulse": "dotPulse 1.4s ease-in-out infinite",
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
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        typingCursor: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        progressIndeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        dotPulse: {
          "0%, 80%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
