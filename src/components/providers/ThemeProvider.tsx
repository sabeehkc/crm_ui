'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useSettingsStore } from '@/store/useSettingsStore'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { accentColor, fontScale, isCompact } = useSettingsStore()

  React.useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', accentColor.primary)
    root.style.setProperty('--primary-foreground', accentColor.foreground)
    root.style.setProperty('--font-scale', fontScale.toString())
    
    if (isCompact) {
      root.classList.add('compact')
    } else {
      root.classList.remove('compact')
    }
  }, [accentColor, fontScale, isCompact])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
