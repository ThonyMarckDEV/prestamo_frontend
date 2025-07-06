// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D3B66', // Azul petróleo profundo
          dark: '#062A4F',    // Azul más oscuro para headers
          light: '#2A5D8F',   // Azul más claro
          soft: '#E6EEF5',    // Fondo suave azulado
        },
        neutral: {
          white: '#FFFFFF',
          softWhite: '#F7F9FA',
          gray: '#D9D9D9',
          dark: '#1A1A1A',
        },
        accent: {
          copper: '#D97706',   // Cobrizo/naranja oscuro para botones
          steel: '#6B7280',    // Gris acero (texto, bordes)
          mint: '#E0F2F1',     // Verde menta muy claro para resaltar fondos sutiles
        },
      },
    },
  },
  plugins: [],
};
