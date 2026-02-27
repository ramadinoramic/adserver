import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a2e',
        surface: '#16213e',
        border: '#0f3460',
        primary: '#e94560',
        secondary: '#533483',
        success: '#00b894',
        text: {
          primary: '#e8e8e8',
          secondary: '#a0a0b0',
        },
        canvas: '#2d2d3d',
        // Panel backgrounds
        panel: '#16213e',
        'panel-hover': '#1e2d50',
        // Input backgrounds
        input: '#0f1923',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'checkerboard': `repeating-conic-gradient(#2d2d3d 0% 25%, #242433 0% 50%)`,
      },
      backgroundSize: {
        'checkerboard': '20px 20px',
      },
    },
  },
  plugins: [],
}

export default config
