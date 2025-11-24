/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stone: { 50: '#FAF9F6', 100: '#F5F5F4', 200: '#E7E5E4', 800: '#292524', 900: '#1C1917' },
        orange: { 50: '#FFF7ED', 200: '#FED7AA', 600: '#EA580C' },
        emerald: { 600: '#059669', 700: '#047857' }
      }
    },
  },
  plugins: [],
}