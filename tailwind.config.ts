import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        canvas: '#fafafa',
        'canvas-elevated': '#ffffff',
        'hairline-soft': '#f2f2f2',
        body: '#4d4d4d',
        mute: '#8f8f8f',
        faint: '#a1a1a1',
        hairline: '#ebebeb',
        link: '#0070f3',
        'link-deep': '#0761d1',
        'link-soft': '#d3e5ff',
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
