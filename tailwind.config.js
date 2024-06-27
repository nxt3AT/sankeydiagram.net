const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark": colors.neutral["800"],
        "accent": "#0369a1"
      }
    },
  },
  plugins: [
  ],
}

