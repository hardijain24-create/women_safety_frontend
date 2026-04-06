/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme Colors
        'navy': {
          DEFAULT: '#1F2A44',
          light: '#2A3A5C',
          dark: '#151B2B',
        },
        'beige': {
          DEFAULT: '#F5F1E8',
          light: '#FAF8F3',
          dark: '#E8E0D0',
        },
        'cream': {
          DEFAULT: '#FAF8F3',
          light: '#FFFDF9',
          dark: '#F0EEE8',
        },
        'slate': {
          DEFAULT: '#4A5D73',
          light: '#5D7388',
          dark: '#3A4A5C',
        },
        'sage': {
          DEFAULT: '#8FAF9A',
          light: '#A8C4B0',
          dark: '#769A82',
        },
        'coral': {
          DEFAULT: '#D95C5C',
          light: '#E87A7A',
          dark: '#C44848',
        },
        'warm-gray': {
          DEFAULT: '#6E6E6E',
          light: '#8A8A8A',
          dark: '#525252',
        },
        // Gold Accent Colors
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#E5C76B',
          dark: '#B89628',
          50: '#FCFAF5',
          100: '#F9F4E8',
          200: '#F0E9D0',
          300: '#E5D9A8',
          400: '#D4AF37',
          500: '#C9A227',
          600: '#B89628',
          700: '#9A7B1F',
          800: '#7D6218',
          900: '#5E4A12',
        },
        // Dark Theme Colors
        'charcoal': {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          dark: '#0F0F0F',
        },
      },
      fontFamily: {
        'sans': ['System', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(31, 42, 68, 0.08)',
        'soft-lg': '0 8px 30px rgba(31, 42, 68, 0.12)',
        'glass': '0 8px 32px rgba(31, 42, 68, 0.1)',
        'gold': '0 4px 20px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
