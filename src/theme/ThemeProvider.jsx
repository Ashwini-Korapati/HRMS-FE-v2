import React, { createContext, useContext, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { selectThemeMode, selectEffectiveThemeMode, setMode, setEffectiveMode } from '../Redux/Public/themeSlice'

const ThemeContext = createContext({ mode: "device", effectiveMode: "light", setMode: () => {} })

function applyTheme(mode, mql) {
  if (typeof document === 'undefined') return mode
  const root = document.documentElement
  const body = document.body
  const prefersDark = mql?.matches ?? false
  const effective = mode === "device" ? (prefersDark ? "dark" : "light") : mode
  const colorScheme = effective === "dark" ? "dark" : "light"

  root.setAttribute("data-theme", effective)
  root.style.colorScheme = colorScheme
  if (body) {
    body.setAttribute("data-theme", effective)
    body.style.colorScheme = colorScheme
  }

  if (effective === "dark") {
    root.classList.add("dark")
    if (body) body.classList.add("dark")
  } else {
    root.classList.remove("dark")
    if (body) body.classList.remove("dark")
  }

  return effective
}

export function ThemeProvider({ children }) {
  const systemMql = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
    return window.matchMedia("(prefers-color-scheme: dark)")
  }, [])
  const dispatch = useDispatch()
  const mode = useSelector(selectThemeMode)
  const effectiveMode = useSelector(selectEffectiveThemeMode)

  // Apply whenever mode changes
  useEffect(() => {
    const eff = applyTheme(mode, systemMql)
    dispatch(setEffectiveMode(eff))
  }, [mode, systemMql, dispatch])

  // Listen to OS changes when in device mode
  useEffect(() => {
    if (mode !== 'device' || !systemMql) return
    const handler = () => {
      const eff = applyTheme('device', systemMql)
      dispatch(setEffectiveMode(eff))
    }
    if (systemMql.addEventListener) {
      systemMql.addEventListener('change', handler)
      return () => systemMql.removeEventListener('change', handler)
    }
    if (systemMql.addListener) {
      systemMql.addListener(handler)
      return () => systemMql.removeListener(handler)
    }
    return undefined
  }, [mode, systemMql, dispatch])

  const value = useMemo(() => ({ mode, effectiveMode, setMode: (m) => dispatch(setMode(m)) }), [mode, effectiveMode, dispatch])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
