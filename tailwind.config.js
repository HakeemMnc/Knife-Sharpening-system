/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'knife-blue': '#2563eb',
        'steel-gray': '#64748b', 
        'sharp-teal': '#0d9488',
        'success-green': '#059669',
        'warning-amber': '#d97706',
      },
      fontFamily: {
        'sans': ['Comic Relief', 'sans-serif'],
      },
      scale: {
        '120': '1.2',
        '130': '1.3',
      },

    },
  },
  plugins: [],
}
