/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1a2e',
        'sidebar-hover': '#16213e',
        'sidebar-active': '#0f3460',
        primary: '#00b4d8',
      },
    },
  },
  plugins: [],
};
