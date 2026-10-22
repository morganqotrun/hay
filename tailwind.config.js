/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[class~="theme-malam"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          elevated: 'var(--color-surface)',
          subtle: 'var(--color-surface-2)',
        },
        main: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          shadow: 'var(--color-accent-shadow)',
        },

        // Brand Single Accent "Jingga"
        jingga: {
          DEFAULT: '#FF6A3D',
          dark: '#B8431F',
          light: '#D9490F',
        },

        // Circle Named Colors (6 warna solid bernama)
        circle: {
          tomat: '#E8452C',
          kunyit: '#F2B134',
          pandan: '#4FA05A',
          laut: '#1E9C93',
          tinta: '#4A63D6',
          dadu: '#F08CAE',
        },
      },
      fontFamily: {
        serif: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'button': '14px',
        'card': '18px',
        'bottomnav': '22px',
        'polaroid': '4px',
        'pill': '9999px',
      },
      boxShadow: {
        'btn-hard': '0 3px 0 var(--color-accent-shadow)',
        'btn-hard-pressed': '0 1px 0 var(--color-accent-shadow)',
        'nav-floating': '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
