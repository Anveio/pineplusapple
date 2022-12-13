/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          charleston: "#01110b",
          jungle: "#253529",
          konbu: "#283618",
          olive: "#606c38",
          cornsilk:'#FEFAE0',
          fawn: "#DDA15E",
          dust: "#E8CCC4",
          dune: '#E7796B',
          liver: "#BC6C25",
          linen: "#F4ECE2",
          mango: "#F58549",
          blond: "#FFFDF3",
          sanmarino: "#46629B",
          chetwode: "#7C94D2",
          goldengrass: "#D6A419"
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
