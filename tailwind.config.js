// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3CB371', // MediumSeaGreen (verde equilibrado)
          dark: '#2E8B57',    // SeaGreen (verde elegante)
          light: '#66CDAA',   // MediumAquamarine
          soft: '#A8E6CF',    // Verde menta claro
        },
        neutral: {
          white: '#FFFFFF',
          softWhite: '#FAFAFA',
          gray: '#E0E0E0',
          dark: '#333333',
        },
        accent: {
          lime: '#A3E635',    // acento fresco
          mint: '#CFFFE5',    // verde muy suave para fondos
          gold: '#FBBF24',    // amarillo dorado para resaltar
        },
      },
    },
  },
  plugins: [],
};
