import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'
import daisyui from 'daisyui'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans, Rajdhani)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display, Orbitron)', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.45), 0 0 40px rgba(0, 240, 255, 0.2), 0 0 60px rgba(0, 240, 255, 0.1)',
        'glow-pink': '0 0 20px rgba(255, 45, 149, 0.45), 0 0 40px rgba(255, 45, 149, 0.2), 0 0 60px rgba(255, 45, 149, 0.1)',
        'glow-purple': '0 0 20px rgba(176, 38, 255, 0.45), 0 0 40px rgba(176, 38, 255, 0.2), 0 0 60px rgba(176, 38, 255, 0.1)',
      },
      colors: {
        'cyber-cyan': '#00f0ff',
        'cyber-pink': '#ff2d95',
        'cyber-purple': '#b026ff',
      },
    },
  },

  // daisyUI config
  daisyui: {
    themes: [
      {
        cyberpunk: {
          primary: '#00f0ff',
          'primary-content': '#0d0b1a',
          secondary: '#ff2d95',
          'secondary-content': '#ffffff',
          accent: '#b026ff',
          'accent-content': '#ffffff',
          neutral: '#1a1625',
          'neutral-content': '#e8e6f0',
          'base-100': '#0d0b1a',
          'base-200': '#151228',
          'base-300': '#1e1a38',
          'base-content': '#e8e6f0',
          info: '#00b4d8',
          'info-content': '#0d0b1a',
          success: '#39ff14',
          'success-content': '#0d0b1a',
          warning: '#ffe600',
          'warning-content': '#0d0b1a',
          error: '#ff3860',
          'error-content': '#ffffff',
        },
      },
      {
        corporate: {
          primary: '#2563eb',
          'primary-content': '#ffffff',
          secondary: '#7c3aed',
          'secondary-content': '#ffffff',
          accent: '#0891b2',
          'accent-content': '#ffffff',
          neutral: '#334155',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          'base-content': '#1e293b',
          info: '#2563eb',
          'info-content': '#ffffff',
          success: '#16a34a',
          'success-content': '#ffffff',
          warning: '#d97706',
          'warning-content': '#ffffff',
          error: '#dc2626',
          'error-content': '#ffffff',
        },
      },
    ],
    darkTheme: 'cyberpunk',
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
  plugins: [typography, forms, animate, daisyui],
} satisfies Config
