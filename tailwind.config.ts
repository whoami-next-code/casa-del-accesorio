import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plaza: '#080A0D',
        stage: '#101318',
        bay: '#1B1F26',
        ink: '#FFFFFF',
        steel: '#B8BEC8',
        line: '#2A3140',
        sun: '#007BFF',
        deep: '#0056D6',
        cta: '#F10600',
        paper: '#080A0D',
        sky: '#1B1F26',
        accent: '#007BFF',
        brake: '#F10600',
        lamp: '#007BFF',
        aluminum: '#B8BEC8',
        smoke: '#B8BEC8',
        ticket: '#1B1F26',
        'ticket-ink': '#FFFFFF',
        'ticket-rule': '#2A3140',
        asphalt: '#080A0D',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        shine: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          to: { backgroundPosition: '0% 0%' },
        },
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        shine: 'shine var(--duration) infinite linear',
      },
    },
  },
  plugins: [],
} satisfies Config;
