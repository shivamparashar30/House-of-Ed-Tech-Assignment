/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan every component/route for className usage
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // App-wide design tokens only (true OTT palette). Component-specific
      // colors are hardcoded as arbitrary values per project conventions.
      colors: {
        background: '#0F0F0F',
        surface: '#121212',
        elevated: '#1A1A1A',
        primary: {
          DEFAULT: '#E50914', // deep red — primary CTAs (Play)
          dark: '#B00710',
        },
        accent: '#F5C518', // amber/gold — ratings & highlights
        muted: '#9CA3AF', // secondary text
      },
    },
  },
  plugins: [],
};
