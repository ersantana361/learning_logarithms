import { createContext, useContext, useMemo, useCallback, useEffect } from 'react'
import { useLocalStorage } from '@hooks/useLocalStorage'

const ThemeContext = createContext(null)

const initialSettings = {
  colorMode: 'light', // 'light' | 'dark'
  highContrast: false,
  fontSize: 'normal', // 'normal' | 'large'
  reduceMotion: false
}

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(
    'logarithms-biology-settings',
    initialSettings
  )

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Color mode
    if (settings.colorMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Font size
    if (settings.fontSize === 'large') {
      root.classList.add('text-lg')
    } else {
      root.classList.remove('text-lg')
    }

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [settings])

  // Detect system preferences on mount
  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches && !settings.reduceMotion) {
      setSettings((prev) => ({ ...prev, reduceMotion: true }))
    }

    // Check for dark mode preference
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleDarkChange = (e) => {
      if (e.matches) {
        setSettings((prev) => ({ ...prev, colorMode: 'dark' }))
      }
    }
    darkQuery.addEventListener('change', handleDarkChange)

    return () => {
      darkQuery.removeEventListener('change', handleDarkChange)
    }
  }, [])

  const toggleColorMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      colorMode: prev.colorMode === 'light' ? 'dark' : 'light'
    }))
  }, [setSettings])

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast
    }))
  }, [setSettings])

  const toggleFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: prev.fontSize === 'normal' ? 'large' : 'normal'
    }))
  }, [setSettings])

  const toggleReduceMotion = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      reduceMotion: !prev.reduceMotion
    }))
  }, [setSettings])

  const resetSettings = useCallback(() => {
    setSettings(initialSettings)
  }, [setSettings])

  const value = useMemo(() => ({
    settings,
    toggleColorMode,
    toggleHighContrast,
    toggleFontSize,
    toggleReduceMotion,
    resetSettings,
    isDark: settings.colorMode === 'dark',
    isHighContrast: settings.highContrast,
    isLargeFont: settings.fontSize === 'large',
    isReducedMotion: settings.reduceMotion
  }), [
    settings,
    toggleColorMode,
    toggleHighContrast,
    toggleFontSize,
    toggleReduceMotion,
    resetSettings
  ])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
