/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#111111',
          800: '#181818',
          700: '#242424',
        },
        espresso: {
          950: '#140D0A',
          900: '#1C1512',
          800: '#2E201B',
          700: '#4D362C',
          600: '#755243',
          500: '#A4745E',
          400: '#C7967F',
        },
        cream: {
          50: '#FCFBF9',
          100: '#F5F2EB',
          200: '#EBE5D8',
          300: '#DCD3C0',
          400: '#C6BBA3',
        },
        gold: {
          400: '#EAD18D',
          500: '#D4AF37',
          600: '#B89222',
        },
        matcha: {
          400: '#A5C48E',
          500: '#7F9C66',
          600: '#647D4F',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'Cinzel', 'Georgia', 'serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        'luxury': '0.25em',
        'superwide': '0.35em',
      },
      boxShadow: {
        'luxury-glow': '0 0 50px -10px rgba(212, 175, 55, 0.15)',
        'glass-edge': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F0DB9E 0%, #D4AF37 50%, #997818 100%)',
        'espresso-radial': 'radial-gradient(circle at center, rgba(46,32,27,0.4) 0%, rgba(10,10,10,0.95) 100%)',
      },
    },
  },
  plugins: [],
}
