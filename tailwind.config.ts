import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plaza: '#F3F6F2',
        stage: '#E4E9DF',
        ink: '#0F172A',
        steel: '#475569',
        line: '#D5DDD0',
        sun: '#E8A317',
        cta: '#DC2626',
        paper: '#F3F6F2',
        sky: '#E4E9DF',
        accent: '#DC2626',
        brake: '#DC2626',
        lamp: '#E8A317',
        aluminum: '#475569',
        smoke: '#475569',
        ticket: '#FFFFFF',
        'ticket-ink': '#0F172A',
        'ticket-rule': '#D5DDD0',
        asphalt: '#F3F6F2',
        bay: '#FFFFFF',
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
