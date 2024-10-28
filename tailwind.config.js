/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(173.21, 21.12%, 49.22%)',
          light: 'hsl(40.61, 39.13%, 49.61%)',
          dark: 'hsl(358.79, 57.89%, 33.53%)',
        },
        cms: {
          black: 'hsl(183.87, 93.94%, 12.94%)',
          accent: 'hsl(173.21, 21.12%, 49.22%)',
          white: 'hsl(0, 0%, 100%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};