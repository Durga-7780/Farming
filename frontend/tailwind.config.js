/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#EEF1EC',
        surface: '#FFFFFF',
        surfacealt: '#F5F7F3',
        primary: {
          DEFAULT: '#163832',
          dark: '#0E2622',
          light: '#1F5449',
          soft: '#E3EAE6'
        },
        accent: {
          DEFAULT: '#D9A441',
          dark: '#B9822B',
          soft: '#F6E7C6'
        },
        ink: '#1B2420',
        muted: '#5C6B63',
        line: '#DDE3DA',
        success: '#3F8F5F',
        danger: '#C0533E',
        info: '#3B6E91'
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '14px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,56,50,0.06), 0 8px 24px -12px rgba(22,56,50,0.12)'
      }
    }
  },
  plugins: []
}
