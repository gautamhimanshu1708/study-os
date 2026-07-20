/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dynamic Surface colors
        surface: {
          primary:   'var(--bg-surface-primary)',
          secondary: 'var(--bg-surface-secondary)',
          hover:     'var(--bg-surface-hover)',
        },
        sidebar: 'var(--bg-sidebar)',
        // Base surfaces
        base: {
          900: 'var(--bg-base)',
          800: 'var(--bg-surface-primary)',
          700: 'var(--bg-surface-secondary)',
          600: 'var(--bg-surface-secondary)',
          500: 'var(--bg-surface-hover)',
          400: '#1e1e30',
          300: '#252540',
        },
        // Primary — indigo/violet
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Accent — cyan
        accent: {
          400: '#38bdf8',
          500: '#22d3ee',
          600: '#06b6d4',
        },
        // Success / Warning / Danger
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
        // Text
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        // Border
        border: {
          DEFAULT: 'var(--border-color)',
          hover:   'var(--border-hover)',
          active:  '#6366f1',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.04) 100%)',
        'gradient-glow':  'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.25) 0%, transparent 65%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(99,102,241,0.25)',
        'glow':     '0 0 24px rgba(99,102,241,0.35)',
        'glow-lg':  '0 0 48px rgba(99,102,241,0.4)',
        'card':     '0 4px 24px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'fade-in-up':    'fadeInUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.35s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':       'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
