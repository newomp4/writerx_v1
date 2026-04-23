/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f4f4f4',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Inter',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['"Arial Black"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        thin: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['"Iowan Old Style"', '"Charter"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'crush': '-0.08em',
      },
    },
  },
  plugins: [],
}
