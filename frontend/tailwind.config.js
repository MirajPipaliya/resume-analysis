/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep dark navy base
        primary:   { DEFAULT: '#080d1a', light: '#0f172a', mid: '#1e293b' },
        // Electric blue accent
        accent:    { DEFAULT: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', glow: '#2563EB' },
        // Emerald success
        success:   { DEFAULT: '#10b981', light: '#34d399', dark: '#059669' },
        // Amber warning
        warning:   { DEFAULT: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
        // Rose danger
        danger:    { DEFAULT: '#f43f5e', light: '#fb7185', dark: '#e11d48' },
        // Violet highlight
        violet:    { DEFAULT: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
        // Neutral surfaces
        surface:   '#f0f4ff',
        card:      '#ffffff',
        'dark-card': '#111827',
        border:    '#e2e8f0',
        muted:     '#94a3b8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-mesh':         'radial-gradient(ellipse at 20% 50%, #1e3a8a33 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, #312e8133 0%, transparent 60%), radial-gradient(ellipse at 50% 90%, #0f172a 0%, #080d1a 100%)',
        'card-gradient':     'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'accent-gradient':   'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        'success-gradient':  'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
        'warning-gradient':  'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        'violet-gradient':   'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      },
      boxShadow: {
        'glow-blue':    '0 0 24px 4px rgba(59,130,246,0.25)',
        'glow-violet':  '0 0 24px 4px rgba(139,92,246,0.25)',
        'glow-green':   '0 0 24px 4px rgba(16,185,129,0.20)',
        'glass':        '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
        'card-elevated':'0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover':   '0 12px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
        'inset-top':    'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 9s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.22,1,0.36,1)',
        'fade-in':     'fadeIn 0.4s ease-out',
        'spin-slow':   'spin 8s linear infinite',
        'gradient-x':  'gradientX 4s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px 4px rgba(59,130,246,0.2)' },
          '50%':      { boxShadow: '0 0 40px 8px rgba(59,130,246,0.4)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: { xs: '2px' },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
