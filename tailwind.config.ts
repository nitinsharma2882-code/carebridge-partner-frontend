import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary:         '#0D9488',
        'primary-dark':  '#0F766E',
        'primary-light': '#EDFAF7',
        'primary-mid':   '#CCFBF1',
        dark:            '#0F172A',
        bg:              '#F8FAFC',
        card:            '#FFFFFF',
        muted:           '#64748B',
        success:         '#16A34A',
        warning:         '#D97706',
        danger:          '#DC2626',
        info:            '#2563EB',
      },
      borderRadius: {
        card: '16px',
        btn:  '14px',
      },
    },
  },
  plugins: [],
}
export default config