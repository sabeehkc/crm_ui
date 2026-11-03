'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useSettingsStore, accentColors } from '@/store/useSettingsStore'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Type, Layout, Check, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { 
    accentColor, 
    setAccentColor, 
    fontScale, 
    setFontScale, 
    isCompact, 
    setIsCompact 
  } = useSettingsStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-16 right-6 left-auto translate-x-0 translate-y-0 w-[380px] sm:rounded-2xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-lg p-5">


        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Mode */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sun className="w-4 h-4" /> Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    theme === t.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Accent Color</label>
            <div className="flex flex-wrap gap-2 p-2">
              {accentColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setAccentColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                    accentColor.name === color.name ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  )}
                  style={{ backgroundColor: color.primary }}
                  title={color.name}
                >
                  {accentColor.name === color.name && (
                    <Check className="w-4 h-4" style={{ color: color.foreground }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" /> Font Scale
              </label>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                {fontScale.toFixed(2)}x
              </span>
            </div>
            <Slider
              value={[fontScale]}
              min={0.8}
              max={1.2}
              step={0.05}
              onValueChange={([val]) => setFontScale(val)}
              className="py-4"
            />
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Layout className="w-4 h-4" /> Compact Mode
              </label>
              <p className="text-xs text-muted-foreground">Reduce spacing for denser UI</p>
            </div>
            <Switch
              checked={isCompact}
              onCheckedChange={setIsCompact}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
