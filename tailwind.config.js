// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000', // rojo oscuro principal
          dark: '#5C0000',    // aún más oscuro
          light: '#B22222',   // rojo fuego
          soft: '#D46A6A',    // rojo claro suave
        },
        neutral: {
          white: '#FFFFFF',
          softWhite: '#F9F9F9',
          gray: '#DADADA',
          dark: '#2A2A2A',
        },
        accent: {
          gold: '#FFD700', // dorado sutil para detalles
          rose: '#C71585', // opcional para llamados a la acción
        },
      },
    },
  },
  plugins: [],
};
