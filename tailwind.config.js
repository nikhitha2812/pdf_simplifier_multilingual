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
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcdcff', 300: '#8ec6ff',
          400: '#59a6ff', 500: '#3385fc', 600: '#1c66f1', 700: '#1551de',
          800: '#1843b4', 900: '#1a3c8e', 950: '#15265a',
        },
        accent: {
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488',
        },
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
