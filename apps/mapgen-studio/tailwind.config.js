/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      colors: {
        light: {
          bg: {
            primary: "#f5f5f7",
            secondary: "#ffffff",
            tertiary: "#f0f0f2",
          },
          text: {
            primary: "#1f2933",
            secondary: "#6b7280",
            muted: "#9ca3af",
          },
          border: {
            primary: "#e5e7eb",
            secondary: "#d1d5db",
          },
          accent: "#4b5563",
        },
        dark: {
          bg: {
            primary: "#0a0a12",
            secondary: "#16161d",
            tertiary: "#1f1f28",
          },
          text: {
            primary: "#e2e2e9",
            secondary: "#7a7a8c",
            muted: "#6a6a7c",
          },
          border: {
            primary: "#26262e",
            secondary: "#32323e",
          },
          accent: "#5e5ce6",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

