import React, { createContext, useContext, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { selectThemeMode, selectEffectiveThemeMode, setMode, setEffectiveMode } from '../Redux/Public/themeSlice'

const ThemeContext = createContext({ mode: "device", effectiveMode: "light", setMode: () => {} })

function applyTheme(mode, mql) {
  const root = document.documentElement
  const effective = mode === "device" ? (mql.matches ? "dark" : "light") : mode
  root.setAttribute("data-theme", effective)
  // Also toggle Tailwind dark class for components using dark: variants
  if (effective === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
  return effective
}

export function ThemeProvider({ children }) {
  const systemMql = useMemo(() => window.matchMedia("(prefers-color-scheme: dark)"), [])
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
    if (mode !== 'device') return
    const handler = () => {
      const eff = applyTheme('device', systemMql)
      dispatch(setEffectiveMode(eff))
    }
    systemMql.addEventListener ? systemMql.addEventListener('change', handler) : systemMql.addListener(handler)
    return () => {
      systemMql.removeEventListener ? systemMql.removeEventListener('change', handler) : systemMql.removeListener(handler)
    }
  }, [mode, systemMql, dispatch])

  const value = useMemo(() => ({ mode, effectiveMode, setMode: (m) => dispatch(setMode(m)) }), [mode, effectiveMode, dispatch])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
