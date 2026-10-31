/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#060911',
          50: '#151b2b',
          100: '#111726',
          200: '#0d121f',
          300: '#090d17',
          400: '#060911',
        },
        sovereign: {
          indigo: '#818cf8',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite alternate',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        wave: {
          '0%': { height: '15%' },
          '100%': { height: '95%' }
        }
      }
    },
  },
  plugins: [],
}

