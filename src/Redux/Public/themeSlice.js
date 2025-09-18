import { createSlice } from '@reduxjs/toolkit'

// Keys
const THEME_KEY = 'theme-mode'

const initialState = {
  mode: typeof window !== 'undefined' ? (localStorage.getItem(THEME_KEY) || 'device') : 'device',
  effectiveMode: 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action) {
      state.mode = action.payload || 'device'
      try { localStorage.setItem(THEME_KEY, state.mode) } catch {}
    },
    setEffectiveMode(state, action) {
      state.effectiveMode = action.payload
    }
  }
})

export const { setMode, setEffectiveMode } = themeSlice.actions
export const selectTheme = s => s.theme
export const selectThemeMode = s => s.theme.mode
export const selectEffectiveThemeMode = s => s.theme.effectiveMode
export default themeSlice.reducer
