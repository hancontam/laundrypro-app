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
        page: '#FFFFFF',
        primary: {
          50: '#DBEAFE',
          100: '#BFDBFE',
          200: '#93C5FD',
          500: '#60A5FA',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: {
          50: '#CCFBF1',
          100: '#99F6E4',
          200: '#5EEAD4',
          600: '#14B8A6',
          700: '#0F766E',
        },
        success: {
          50: '#F0FDF4',
          400: '#4ADE80',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        error: {
          50: '#FEF2F2',
          400: '#F87171',
          600: '#EF4444',
          700: '#DC2626',
        },
        slate: {
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        indigo: {
          50: '#DBEAFE',
          100: '#BFDBFE',
          200: '#93C5FD',
          500: '#60A5FA',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        green: {
          50: '#F0FDF4',
          600: '#16A34A',
          700: '#15803D',
        },
        red: {
          50: '#FEF2F2',
          200: '#FECACA',
          500: '#F87171',
          600: '#EF4444',
          700: '#DC2626',
        },
        amber: {
          50: '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
        },
      },
      boxShadow: {
        // §5.5 — Custom shadows
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        glow: '0 0 20px rgba(37, 99, 235, 0.35)',
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
