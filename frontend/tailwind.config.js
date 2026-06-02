/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        primary: { DEFAULT: '#534AB7', light: '#EEEDFE', dark: '#3C3489' },
        accent:  { DEFAULT: '#1D9E75', light: '#E1F5EE' },
        highlight: { DEFAULT: '#D85A30', light: '#FAECE7' },
        ink:     '#0A0F1E',
        carddark: '#111827',
      },
      borderRadius: { xl: '14px', '2xl': '18px' },
    },
  },
  plugins: [],
}
