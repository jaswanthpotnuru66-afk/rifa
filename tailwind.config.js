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
          pink:      '#C17B7B', // Warm dusty rose — primary accent
          cream:     '#F9F9F6', // Off-white page background
          beige:     '#F1EDE8', // Warm beige surface
          rose: {
            50:  '#FAF3F3',
            100: '#F3E5E5',
          },
          sage:      '#8A9E8A', // Muted sage green
          mauve:     '#9E7B8A', // Muted mauve
          text:      '#0A0A0A', // Near-black
          'menu-text': '#1A1A1A',
          gold:      '#C4956A', // Warm gold accent
          chocolate: '#F3E5D8', // Warm cream surface
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
