/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bosch: {
          red: '#D50032',
          'red-dark': '#B9002D',
          navy: '#0F172A',
          slate: '#334155',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
      },
      boxShadow: {
        soft: '0 8px 30px rgb(0 0 0 / 0.04)',
        hover: '0 8px 30px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}