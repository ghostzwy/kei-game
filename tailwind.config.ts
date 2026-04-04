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
        'kei-dark': '#020617',
        'kei-card': '#1a1f2e',
        'kei-accent': '#10b981',
        'kei-secondary': '#0f172a',
      },
      backgroundColor: {
        base: '#020617',
        card: '#1a1f2e',
      },
      borderColor: {
        accent: '#10b981',
      },
      textColor: {
        accent: '#10b981',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(16, 185, 129, 0.3)',
        'neon-lg': '0 0 20px rgba(16, 185, 129, 0.5)',
        'neon-glow': '0 0 30px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-lines': 'scan-lines 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            textShadow: '0 0 10px #10b981',
          },
          '50%': {
            opacity: '0.8',
            textShadow: '0 0 20px #10b981',
          },
        },
        'scan-lines': {
          '0%': {
            backgroundPosition: '0 0',
          },
          '100%': {
            backgroundPosition: '0 100px',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
