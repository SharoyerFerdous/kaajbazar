/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0f7ea',
          100: '#dff0d2',
          200: '#c1e2aa',
          300: '#9acf78',
          400: '#75b84d',
          500: '#538135',
          600: '#385623',
          700: '#2c431b',
          800: '#203113',
          900: '#14200d',
        },
      },
      fontFamily: {
        sans: ['var(--font-lexend)', 'var(--font-hind)', 'sans-serif'],
        bn: ['var(--font-hind)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
