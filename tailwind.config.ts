import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kei-dark': '#0a0b10',
        'kei-card': '#161b22',
        'kei-accent': '#00ff41',
      },
      backgroundColor: {
        base: '#0a0b10',
        card: '#161b22',
      },
      borderColor: {
        accent: '#00ff41',
      },
      textColor: {
        accent: '#00ff41',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.3)',
        'neon-lg': '0 0 20px rgba(0, 255, 65, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            textShadow: '0 0 10px #00ff41',
          },
          '50%': {
            opacity: '0.8',
            textShadow: '0 0 20px #00ff41',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
