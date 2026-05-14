/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        xl: "1080px"
      }
    },
    extend: {
      spacing: {
        "dvh-screen": "100dvh"
      },
      minHeight: {
        screen: "100dvh"
      },
      colors: {
        border: "rgba(148, 163, 184, 0.28)",
        background: "#05060b",
        foreground: "#fff7ed",
        primary: {
          DEFAULT: "#ff6a00",
          foreground: "#fff7ed"
        },
        "primary-glow": "#ff9500",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.72)",
          foreground: "#e2e8f0"
        },
        muted: {
          DEFAULT: "rgba(148, 163, 184, 0.35)",
          foreground: "#cbd5e1"
        },
        surface: "rgba(17, 24, 39, 0.85)"
      },
      backgroundImage: {
        hero:
          "linear-gradient(160deg, #ff8a00 0%, #ff6a00 45%, #ff4d00 100%)"
      },
      fontFamily: {
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      boxShadow: {
        glow: "0 12px 34px rgba(255, 106, 0, 0.45)",
        card: "0 14px 30px rgba(1, 4, 14, 0.42)"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fadeIn 650ms ease-out both"
      }
    }
  },
  plugins: []
};
