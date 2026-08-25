import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        'canvas-elevated': 'rgb(var(--color-canvas-elevated) / <alpha-value>)',
        'hairline-soft': 'rgb(var(--color-hairline-soft) / <alpha-value>)',
        body: 'rgb(var(--color-body) / <alpha-value>)',
        mute: 'rgb(var(--color-mute) / <alpha-value>)',
        faint: 'rgb(var(--color-faint) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
        link: 'rgb(var(--color-link) / <alpha-value>)',
        'link-deep': 'rgb(var(--color-link-deep) / <alpha-value>)',
        'link-soft': 'rgb(var(--color-link-soft) / <alpha-value>)',
        violet: '#7928ca',
        cyan: '#50e3c2',
        pink: '#ff0080',
        magenta: '#eb367f',
        error: '#ee0000',
        'error-deep': '#c50000',
        warning: '#f5a623',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'Arial', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        pillCategory: '64px',
        pill: '100px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        '3xl': '64px',
        '4xl': '96px',
        section: '128px',
      },
    },
  },
}
