module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // New wishlist color palette
        primary: {
          DEFAULT: '#8B5CF6', // Purple
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        secondary: {
          DEFAULT: '#EC4899', // Pink
          light: '#F472B6',
          dark: '#DB2777',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FCD34D',
          dark: '#D97706',
        },
        background: {
          DEFAULT: '#F9FAFB',
          dark: '#F3F4F6',
        },
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
    },
  },
  plugins: [],
};
