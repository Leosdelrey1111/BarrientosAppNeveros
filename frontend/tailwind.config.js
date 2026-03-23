/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        teal:  { DEFAULT: "#0D9488", dark: "#0F766E", light: "#CCFBF1" },
        navy:  { DEFAULT: "#0F2D40", light: "#1A3F58" },
        sand:  "#F5EFE6",
        cream: "#FDFAF6",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
