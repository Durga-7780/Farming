/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f8fafc',
        surface: '#ffffff',
        surfacealt: '#f1f5f9',
        sidebar: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          border: '#1e293b'
        },
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
          soft: '#eff6ff'
        },
        accent: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
          light: '#818cf8',
          soft: '#eef2ff'
        },
        ink: '#0f172a',
        muted: '#475569',
        line: '#e2e8f0',
        lineborder: '#cbd5e1',
        success: '#059669',
        warning: '#d97706',
        danger: '#e11d48',
        info: '#0284c7'
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '16px'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        glow: '0 0 20px -3px rgba(37, 99, 235, 0.25)'
      }
    }
  },
  plugins: []
}
