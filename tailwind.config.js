/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          olive: "#606c38",
          konbu: "#283618",
          cornsilk:'#FEFAE0',
          fawn: "#DDA15E",
          liver: "#BC6C25",
          linen: "#F4ECE2",
          mango: "#F58549",
          blond: "#FFFDF3"
        },
      },
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
