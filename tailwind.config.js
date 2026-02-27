/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // §3.1 — Plus Jakarta Sans only, controlled via fontWeight
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // §2.1 — Custom structural color
        page: '#F8F9FB',
        // §2.5 — Brand colors (reserved)
        brand: {
          purple: '#E5DEFF',
          yellow: '#FFF4C3',
          orange: '#FFDCC2',
          cyan: '#C6F6F6',
          dark: '#0F172A',
        },
      },
      boxShadow: {
        // §5.5 — Custom shadows
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        glow: '0 0 20px rgba(99, 102, 241, 0.5)',
      },
      borderRadius: {
        // §5.4 — Extended radii
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      letterSpacing: {
        // §3.3 — tracking-wider for uppercase labels
        wider: '0.05em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
};
