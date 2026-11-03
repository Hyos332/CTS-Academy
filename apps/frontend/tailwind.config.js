/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a2ff',
          500: '#327fff',
          600: '#1b60f5',
          700: '#144adb',
          800: '#173dae',
          900: '#193889',
          950: '#142454',
        },
      },
    },
  },
  plugins: [],
};
