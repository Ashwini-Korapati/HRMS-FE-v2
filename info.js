/ Central color palette + semantic tokens
// Scales mostly mirror Tailwind for consistency
 
const scale = {
  orange: {
    50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',
    500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12'
  },
  amber:  {
    50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',
    500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f'
  },
  rose:   {
    50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',
    500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337'
  },
  emerald:{
    50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',
    500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b'
  },
  sky:    {
    50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',
    500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e'
  },
  violet: {
    50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',
    500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95'
  },
  fuchsia:{
    50:'#fdf4ff',100:'#fae8ff',200:'#f5d0fe',300:'#f0abfc',400:'#e879f9',
    500:'#d946ef',600:'#c026d3',700:'#a21caf',800:'#86198f',900:'#701a75'
  },
  neutral:{
    50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',
    500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717'
  }
}
 
// Semantic tokens (light mode)
const light = {
  bg: 'linear-gradient(135deg,#f8fafc 0%,#ffffff 50%,#eff6ff 100%)',
  text: scale.neutral[900],
  textMuted: scale.neutral[600],
  textSubtle: scale.neutral[500],
  border: 'rgba(0,0,0,0.06)',
  panel: 'rgba(255,255,255,0.70)',
  panelAlt: 'rgba(255,255,255,0.55)',
 
  primary: scale.orange[500],
  primaryHover: scale.orange[600],
  primaryRing: scale.orange[300],
 
  success: scale.emerald[500],
  info: scale.sky[500],
  warning: scale.amber[500],
  danger: scale.rose[500],
 
  accentA: scale.violet[500],
  accentB: scale.fuchsia[500],
 
  graphLine: scale.orange[500],
  graphLineAlt: scale.sky[500],
  graphArea: 'rgba(249,115,22,0.18)',
  graphGrid: 'rgba(0,0,0,0.08)',
 
  codeBg: scale.neutral[100],
  focusOutline: scale.orange[400]
}
 
// Semantic tokens (dark mode)
const dark = {
  bg: scale.neutral[900],
  text: scale.neutral[100],
  textMuted: scale.neutral[400],
  textSubtle: scale.neutral[400],
  border: 'rgba(255,255,255,0.10)',
  panel: 'rgba(23,23,23,0.75)',
  panelAlt: 'rgba(38,38,38,0.65)',
 
  primary: scale.orange[500],
  primaryHover: scale.orange[400],
  primaryRing: 'rgba(249,115,22,0.35)',
 
  success: scale.emerald[400],
  info: scale.sky[400],
  warning: scale.amber[400],
  danger: scale.rose[400],
 
  accentA: scale.violet[400],
  accentB: scale.fuchsia[400],
 
  graphLine: scale.orange[400],
  graphLineAlt: scale.sky[400],
  graphArea: 'rgba(249,115,22,0.25)',
  graphGrid: 'rgba(255,255,255,0.08)',
 
  codeBg: scale.neutral[800],
  focusOutline: scale.orange[500]
}
 
// Helper to export CSS variables (optional use)
export function paletteToCSS(mode='light') {
  const src = mode === 'dark' ? dark : light
  return Object.entries(src).map(([k,v]) => `--${k}:${v};`).join('\n')
}
 
export const palette = { scale, light, dark }
 
// Example usage:
//
// import { palette } from './palette'
// const primary500 = palette.scale.orange[500]
//
// In a styled component / inline:
// style={{ background: `var(--panel)` }}
//
// To inject dynamic theme vars in JS (if not relying on existing index.css):
// document.documentElement.style.cssText += paletteToCSS('dark')
 
export default palette