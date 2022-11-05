/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        'mobile-nav': '1fr 1fr 1fr'
      },
      fontSize: {
        'top-navbar': '3.5rem',
      },
      height: {
        'top-navbar': '3.5rem',
      },
      space: {
        'top-navbar': '3.5rem',
      }
    },
  },
  darkMode: "class",
  plugins: [],
};
