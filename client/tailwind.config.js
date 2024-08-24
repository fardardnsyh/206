/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // https://modernfontstacks.com/
        // Neo-Grotesque
        sans: [
          'Inter',
          'Roboto',
          'Helvetica Neue',
          'Arial Nova',
          'Nimbus Sans',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

