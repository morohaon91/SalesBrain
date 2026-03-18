/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // RTL support - direction selector for CSS variable usage
  corePlugins: {
    direction: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#134e4a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      // RTL-aware utilities
      spacing: {
        'sidebar-width': '16rem',
      },
    },
  },
  plugins: [
    // RTL direction plugin
    function ({ addBase, addComponents, addUtilities, e, theme }) {
      addUtilities({
        // Logical properties utilities for RTL
        '.start-0': {
          'inset-inline-start': '0',
        },
        '.end-0': {
          'inset-inline-end': '0',
        },
        '.ps-0': {
          'padding-inline-start': '0',
        },
        '.ps-2': {
          'padding-inline-start': '0.5rem',
        },
        '.ps-3': {
          'padding-inline-start': '0.75rem',
        },
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.pe-0': {
          'padding-inline-end': '0',
        },
        '.pe-2': {
          'padding-inline-end': '0.5rem',
        },
        '.pe-3': {
          'padding-inline-end': '0.75rem',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        '.ms-0': {
          'margin-inline-start': '0',
        },
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-0': {
          'margin-inline-end': '0',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.flip-rtl': {
          'transform': 'scaleX(-1)',
        },
      });
    },
  ],
};
