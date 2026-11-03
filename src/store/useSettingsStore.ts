import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor = {
  name: string
  primary: string
  foreground: string
}

export const accentColors: AccentColor[] = [
  { name: 'Red', primary: 'oklch(0.55 0.18 25)', foreground: 'oklch(1 0 0)' },
  { name: 'Blue', primary: 'oklch(0.6 0.18 250)', foreground: 'oklch(1 0 0)' },
  { name: 'Violet', primary: 'oklch(0.6 0.2 280)', foreground: 'oklch(1 0 0)' },
  { name: 'Green', primary: 'oklch(0.6 0.15 150)', foreground: 'oklch(1 0 0)' },
  { name: 'Orange', primary: 'oklch(0.65 0.18 45)', foreground: 'oklch(1 0 0)' },
  { name: 'Yellow', primary: 'oklch(0.8 0.15 85)', foreground: 'oklch(0.2 0.02 85)' },
  { name: 'Pink', primary: 'oklch(0.6 0.2 330)', foreground: 'oklch(1 0 0)' },
  { name: 'Cyan', primary: 'oklch(0.7 0.15 200)', foreground: 'oklch(0.2 0.02 200)' },
]

interface SettingsState {
  accentColor: AccentColor
  fontScale: number
  isCompact: boolean
  setAccentColor: (color: AccentColor) => void
  setFontScale: (scale: number) => void
  setIsCompact: (compact: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accentColor: accentColors[0],
      fontScale: 1,
      isCompact: false,
      setAccentColor: (color) => set({ accentColor: color }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setIsCompact: (compact) => set({ isCompact: compact }),
    }),
    {
      name: 'crm-settings',
    }
  )
)
