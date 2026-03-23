/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './products/*.html',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#E8F5EF',
          100: '#C8EAD8',
          200: '#90D4B0',
          300: '#6DD4A8',
          400: '#44C988',
          500: '#3ABF82',
          600: '#269A68',
          700: '#22905E',
          800: '#186060',
          900: '#124830',
        },
        cream: {
          50:  '#FEFCF8',
          100: '#F7F3EC',
          200: '#EDE5D5',
          300: '#DDD0BC',
        },
        honey: {
          300: '#F0C96A',
          400: '#E4A94A',
          500: '#C8922A',
          600: '#A97520',
          700: '#9B6C14',
        },
        terra: {
          100: '#D0F0EE',
          200: '#9ADAD6',
          300: '#5EC4BC',
          500: '#18988B',
          700: '#0F6B62',
          800: '#083F3B',
        },
        dorso: {
          100: '#F5E0EC',
          400: '#C47B8E',
          600: '#7B3A60',
          700: '#5A2A4A',
          800: '#3B2030',
        },
      },
      fontFamily: {
        display: ['"Montserrat"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
