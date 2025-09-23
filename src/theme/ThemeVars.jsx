import React, { useEffect } from 'react'
import palette, { paletteToCSS } from './palette'
 
export default function ThemeVars({ mode }) {
  useEffect(() => {
    const root = document.documentElement
    const target = mode === 'dark' ? palette.dark : palette.light
    Object.entries(target).forEach(([k,v]) => root.style.setProperty(`--${k}`, v))
  }, [mode])
  return null
}