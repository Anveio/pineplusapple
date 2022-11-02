/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "mobile-nav": "1fr 1fr 1fr",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
