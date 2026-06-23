/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bcd2ff",
          300: "#8eb2ff",
          400: "#5887f7",
          500: "#2f63ea",
          600: "#0052cc",
          700: "#0042a6",
          800: "#063785",
          900: "#0a316c",
          950: "#071f47",
        },
        teal: {
          50: "#eafaf6",
          100: "#cdf2e7",
          200: "#9fe5d3",
          300: "#66d2ba",
          400: "#33b89c",
          500: "#149a82",
          600: "#0a7d6b",
          700: "#0a6356",
          800: "#0b4f46",
          900: "#0b413b",
          950: "#04231f",
        },
        ink: "#0b1524",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,21,36,.04), 0 8px 24px -10px rgba(11,21,36,.10)",
        lift: "0 2px 6px rgba(11,21,36,.05), 0 24px 48px -16px rgba(11,21,36,.18)",
        glow: "0 8px 28px -6px rgba(0,82,204,.45)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
