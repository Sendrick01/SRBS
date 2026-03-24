/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: '#004c22',
        'primary-container': '#166534',
        surface: '#f8f9fb',
        'on-surface': '#191c1e',
        secondary: '#625e59',
        'surface-container-low': '#f3f4f6',
        'surface-container-lowest': '#ffffff',
        'outline-variant': '#bfc9bd',
      },
    },
  },
  plugins: [],
}
