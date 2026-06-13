/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Workspace (editor) — film-slate charcoal
        slate: {
          900: "#141517",
          850: "#191b1e",
          800: "#1f2225",
          700: "#2a2e33",
          600: "#3a3f46",
          500: "#565c64",
          400: "#8b929b",
          300: "#b6bcc4",
        },
        // Document — warm paper + ink
        paper: "#FBFAF7",
        ink: "#16150F",
        // Accents
        amber: {
          DEFAULT: "#F2B705",
          soft: "#FBE08A",
          deep: "#C99300",
        },
        safety: "#E5484D",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        doc: "0 24px 60px -24px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
