import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files and ships only the classes it finds.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  // Provides animate-in / fade-in / slide-in-from-*, used on expanding cards
  // and popovers. These never worked via the CDN, which has no plugins.
  plugins: [animate],
};
