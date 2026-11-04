/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Corporativa Oficial Grupo FUNIBER SD - v2.1
        primary: {
          50: '#E6EFF5',
          100: '#CCDDEB',
          200: '#B3CDE1',
          300: '#99BCD7',
          400: '#80ABCD',
          500: '#679AC3',
          600: '#4E8AB9',
          700: '#3479AF',
          800: '#1B68A5',
          900: '#01579B', // Main Primary FUNIBER Blue
          950: '#004174', // Alternate Deep Navy
        },
        // Alias brand vinculado al azul primario oficial de FUNIBER
        brand: {
          50: '#E6EFF5',
          100: '#CCDDEB',
          200: '#B3CDE1',
          300: '#99BCD7',
          400: '#80ABCD',
          500: '#4E8AB9',
          600: '#01579B', // Color primario de acción
          700: '#004174', // Hover
          800: '#1B68A5',
          900: '#002847',
          950: '#001A30',
        },
        // Tokens semánticos oficiales FUNIBER SD v2.1
        funiber: {
          blue: '#01579B',
          navy: '#004174',
          lightBlue: '#E6EFF5',
          neutral50: '#FAFAFA',
          neutral100: '#F5F5F5',
          neutral200: '#EEEEEE',
          neutral300: '#E0E0E0',
          neutral400: '#BDBDBD',
          neutral500: '#9E9E9E',
          neutral600: '#757575',
          neutral700: '#616161',
          neutral800: '#424242',
          neutral900: '#212121',
          critical: '#D32F2F',
          criticalLight: '#FFEBEE',
          warning: '#F57C00',
          warningLight: '#FFF3E0',
          success: '#2E7D32',
          successLight: '#E8F5E9',
          info: '#084DC4',
          infoLight: '#E8F0FE',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '8px',
        btn: '8px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        funiber: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

