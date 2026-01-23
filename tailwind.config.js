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
        primary: '#0284c7', // Sky Blue 600
        rose: { // Remapped to Blue scale
          50: '#f0f9ff', // light blue pastel
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          DEFAULT: '#0284c7',
        },
        // Custom Palette
        'brand': {
          cream: '#E6F4FA', // Light Blue Pastel (Main BG)
          beige: '#F1F5F9', // Slate 50
          pink: '#38BDF8', // Remapped to Bright Blue accent
          rose: { // Remapped to Blue scale for explicit brand-rose usages
            50: '#E6F4FA',
            100: '#e0f2fe',
          },
          sage: '#94a3b8', // Slate
          mauve: '#64748b', // Slate
          text: '#020617', // Very Dark Blue/Black
          'menu-text': '#1e293b', // Slate 800
          gold: '#0ea5e9', // Blue Accent
          chocolate: '#F3E5D8', // Keeping chocolate as distinct accent
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
