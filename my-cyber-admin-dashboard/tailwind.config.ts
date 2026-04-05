import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enable dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Specify the paths to all of your template files
  ],
  theme: {
    extend: {
      colors: {
        'cyber-green': '#00ff41',
        'cyber-gray': '#0a0b10',
        'cyber-dark': '#1a1a1a',
        'cyber-light': '#f5f5f5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Add your preferred font
      },
    },
  },
  plugins: [],
};

export default config;