import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F3EE',
        sand: '#E8DFD3',
        ink: '#2B2B2B',
        muted: '#6B6560',
        accent: '#B4532A',
        'accent-dark': '#8F3E1D',
      },
      fontFamily: {
        sans: ['var(--font-ibm)', 'var(--font-ibm-ar)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '80rem',
      },
    },
  },
  plugins: [],
};

export default config;
