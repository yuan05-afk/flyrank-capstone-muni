/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F3F7",
        surface: "#FFFFFF",
        ink: "#101828",
        muted: "#667085",
        line: "#E4E7EC",
        muni: "#D97706",
        "muni-bright": "#F59E0B",
        fog: "#FEF3C7",
        ok: "#15803D",
        warn: "#B45309",
        danger: "#DC2626",
      },
      fontFamily: {
        display: ["Outfit", "Figtree", "sans-serif"],
        sans: ["Figtree", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
