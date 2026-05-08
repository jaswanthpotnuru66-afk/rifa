/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        // Custom Brand Palette — Rifa Arts & Crafts
        'brand': {
          // Vibrant primary accent — deep rose
          pink:      '#D4547A',
          'pink-light': '#F2A5BE',
          'pink-dark': '#A83058',
          // Champagne / off-white backgrounds
          cream:     '#FAF7F2',
          beige:     '#F2EBE0',
          rose: {
            50:  '#FFF0F4',
            100: '#FFD6E4',
          },
          // Vivid accent colors
          gold:      '#E8A020',   // Warm amber-gold
          'gold-light': '#FFDFA0',
          sage:      '#4A8C6F',   // Rich emerald-sage
          'sage-light': '#A8D4BC',
          mauve:     '#9E5C7A',   // Deep mauve
          lavender:  '#7C6FCD',   // Indigo-lavender accent
          terracotta:'#C4603A',   // Warm terracotta
          // Neutrals
          text:        '#0A0A0A',
          'menu-text': '#1A1A1A',
          chocolate:   '#F5ECE0',
        }
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease-out',
        'slide-up':  'slideUp 0.5s ease-out',
        'shimmer':   'shimmer 2.5s infinite',
        'float':     'float 6s ease-in-out infinite',
        'glow-pulse':'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,84,122,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(212,84,122,0.6)' },
        },
      }
    },
  },
  plugins: [],
}
