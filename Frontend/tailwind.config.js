/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'Prompt', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      boxShadow: {
        'gold': '0 0 15px rgba(217, 119, 6, 0.3)',
        'gold-lg': '0 0 30px rgba(217, 119, 6, 0.5)',
      },
    },
  },
  plugins: [],
  darkMode: "class",
}
