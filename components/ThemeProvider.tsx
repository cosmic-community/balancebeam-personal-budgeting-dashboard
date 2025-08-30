'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialDarkMode?: boolean
}

export function ThemeProvider({ children, initialDarkMode = false }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage on client side
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode, mounted])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}