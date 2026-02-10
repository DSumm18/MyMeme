import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#FF6B9D',
        'bright-yellow': '#FFD93D',
        'mint-green': '#6BCB77',
        'coral-orange': '#FF8C42',
        'dark-blue': '#1A1A2E',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
export default config