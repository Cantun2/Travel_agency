import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Encre de nuit — la mer et le ciel du voyage
        ink: {
          DEFAULT: "#0E1E33",
          deep: "#070F1C",
          soft: "#1A2D49",
          line: "#283C5C",
        },
        // Papier chaud — les sections de lecture
        paper: {
          DEFAULT: "#F7F4EC",
          deep: "#ECE5D6",
        },
        // Braise — l'unique accent : route, prix, états actifs
        ember: {
          DEFAULT: "#E2552D",
          soft: "#F2A98F",
          deep: "#B23E1C",
        },
        // Laiton — labels discrets, instruments
        brass: "#B8843A",
        mist: "#90A0B5",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
