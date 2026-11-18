/** @type {import('tailwindcss').Config} */

// Neutral scale is driven by CSS variables so every `ink-*` class flips automatically in dark mode.
const ink = Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k) => [k, `rgb(var(--ink-${k}) / <alpha-value>)`])
);

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink,
        // Static navy used for the sidebar, tooltips and hero panels (same in light & dark).
        navy: { 700: '#1c2f4f', 800: '#14233d', 900: '#0d1a30', 950: '#081224' },
        // Medical teal accent
        brand: { 50: '#effcfb', 100: '#c9f6f2', 200: '#95ece5', 300: '#5bdad3', 400: '#2cc0bb', 500: '#14a3a0', 600: '#0d8383', 700: '#0f6869', 800: '#115355', 900: '#134547' },
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / .04), 0 1px 3px rgb(15 23 42 / .06)',
        pop: '0 16px 48px -12px rgb(8 18 36 / .35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop-in': { from: { opacity: 0, transform: 'translateY(6px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
      },
      animation: {
        'fade-in': 'fade-in .15s ease-out',
        'pop-in': 'pop-in .18s cubic-bezier(.2,.9,.3,1.1)',
        'slide-in': 'slide-in .22s ease-out',
        'slide-in-right': 'slide-in-right .25s cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
};
