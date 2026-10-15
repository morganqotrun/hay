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
        // Dynamic semantic colors driven by CSS variables
        app: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          subtle: 'var(--color-surface-subtle)',
        },
        main: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',

        // Studio Accent Palette (Punchy & Vibrant on both Cerah and Malam)
        coral: {
          DEFAULT: '#FF5A36',
          hover: '#FA4620',
          glow: 'rgba(255, 90, 54, 0.25)',
          subtle: 'rgba(255, 90, 54, 0.12)',
        },
        magenta: {
          DEFAULT: '#E8467C',
          hover: '#DB336B',
          glow: 'rgba(232, 70, 124, 0.25)',
          subtle: 'rgba(232, 70, 124, 0.12)',
        },
        mustard: {
          DEFAULT: '#FFB627',
          hover: '#E59F17',
          glow: 'rgba(255, 182, 39, 0.25)',
          subtle: 'rgba(255, 182, 39, 0.15)',
        },
        lime: {
          DEFAULT: '#8CC63F',
          hover: '#79B32E',
          glow: 'rgba(140, 198, 63, 0.25)',
          subtle: 'rgba(140, 198, 63, 0.15)',
        },
        biru: {
          DEFAULT: '#3B8FE8',
          hover: '#267CD9',
          glow: 'rgba(59, 143, 232, 0.25)',
          subtle: 'rgba(59, 143, 232, 0.15)',
        },
        ungu: {
          DEFAULT: '#9B6DE8',
          hover: '#8753DB',
          glow: 'rgba(155, 109, 232, 0.25)',
          subtle: 'rgba(155, 109, 232, 0.15)',
        },

        // Brand Blue-Cyan Gradient Tokens (#3B8FE8 to #3ED9E8)
        brand: {
          blue: '#3B8FE8',
          cyan: '#3ED9E8',
          gradient: 'linear-gradient(135deg, #3B8FE8 0%, #3ED9E8 100%)',
        },

        // Mood Tokens (WAJIB SOLID & KONTRAS TINGGI, Teks Putih)
        mood: {
          senang: '#FFB627',   // mustard
          santai: '#3ED9E8',   // biru muda
          sibuk: '#8CC63F',    // lime
          lelah: '#9B6DE8',    // ungu
          sedih: '#2B5FA8',    // biru tua
          semangat: '#FF5A36', // coral
        },

        // Brand Base Hay Tokens
        hay: {
          50: '#FDF8F3',
          100: '#F7EFE6',
          200: '#EDE4DA',
          500: '#C79E59',
          800: '#6E4C29',
          900: '#1F1D2B',
          950: '#17162A',
        }
      },
      fontSize: {
        // Strict Design System Typography Hierarchy
        'heading': ['26px', { lineHeight: '1.25', fontWeight: '700' }],
        'subheading': ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'username': ['15px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'metadata': ['11px', { lineHeight: '1.45', fontWeight: '500' }],
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.04)',
        'soft': '0 8px 24px -4px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.09)',
        'glow-coral': '0 8px 20px -2px rgba(255, 90, 54, 0.35)',
        'glow-mustard': '0 8px 20px -2px rgba(255, 182, 39, 0.35)',
        'glow-biru': '0 8px 20px -2px rgba(59, 143, 232, 0.35)',
        'glow-ungu': '0 8px 20px -2px rgba(155, 109, 232, 0.35)',
      },
      borderRadius: {
        'card': '20px',
        'pill': '9999px',
        'bubble': '16px',
      },
      animation: {
        'heart-bounce': 'heart-bounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'fade-slide-up': 'fade-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'heart-bounce': {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.35) rotate(-6deg)' },
          '65%': { transform: 'scale(0.92) rotate(4deg)' },
          '85%': { transform: 'scale(1.06) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
