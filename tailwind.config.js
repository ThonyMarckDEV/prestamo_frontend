/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {

      colors: {
        primary: {
          DEFAULT: '#6B1016', // Granate profundo ligeramente más oscuro que #80131B
          dark: '#4F0C11',    // Granate más oscuro
          light: '#8A131A',   // Granate más claro (aun oscuro)
          soft: '#F8E0E2',    // Fondo suave rosado-granate oscuro
          100: '#FCEEEF',     // Granate muy claro para fondos
          600: '#7F161B',     // Granate oscuro para hover
          800: '#3F080C',     // Granate muy oscuro para texto
        },
        
        neutral: {
          white: '#FFFFFF',
          softWhite: '#F7F9FA',
          gray: '#D9D9D9',
          dark: '#1A1A1A',
        },
        accent: {
          copper: {
            DEFAULT: '#D97706', // Cobrizo/naranja oscuro para botones
            600: '#B35F05',     // Darker copper for hover
            800: '#8C4A04',     // Darker copper for text
          },
          steel: {
            DEFAULT: '#6B7280', // Gris acero (texto, bordes)
            600: '#4B5563',     // Darker steel for hover
          },
          mint: {
            DEFAULT: '#E0F2F1', // Verde menta muy claro
            100: '#F1FAF9',     // Lighter mint for backgrounds
          },
          yellow: {
            50: '#FEF9C3',      // Soft, faded yellow (matches yellow-50)
            100: '#FFFBE6',     // Lighter yellow for subtle backgrounds
            200: '#FEF08A',     // Light yellow (matches yellow-200)
            300: '#FDE68A',     // Medium yellow (matches yellow-300)
            400: '#FACC15',     // Brighter yellow (matches yellow-400)
            600: '#D97706',     // Darker yellow/copper-like (matches accent.copper.DEFAULT)
            700: '#B45309',     // Dark yellow (matches yellow-700)
            800: '#92400E',     // Darker yellow (matches yellow-800)
          },
        },
      },
      
    },
  },
  plugins: [],
};