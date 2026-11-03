'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Bell, 
  Settings, 
  Sun, 
  Moon, 
  ChevronDown 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { SettingsModal } from './SettingsModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96  max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search.." 
          className="pl-10 h-10 bg-white dark:bg-input border-none dark:border-solid dark:border-muted/30 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button 
          variant="outline" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted transition-colors border-slate-200 dark:border-muted h-8 px-3 flex items-center gap-1 shadow-sm w-[76px] justify-center"
        >
          {mounted ? (
            theme === 'dark' ? (
              <>
                <span className="text-base leading-none">☀️</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Light</span>
              </>
            ) : (
              <>
                <span className="text-base leading-none">🌙</span>
                <span className="text-sm font-semibold text-slate-500">Dark</span>
              </>
            )
          ) : (
             <div className="w-10"></div> /* Placeholder to prevent layout shift */
          )}
        </Button>
        

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-colors">
            <Bell className="w-5 h-5" />
          </Button>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-background text-[10px]">
            3
          </Badge>
        </div>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Profile */}
        <UserProfile />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  )
}

import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useLogoutMutation } from '@/store/services/authSlice'
import { useRouter } from 'next/navigation'

function UserProfile() {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      router.push('/login')
    } catch (err) {
      console.error('Logout failed, redirecting anyway:', err)
      // Fallback to login regardless if logout triggers any server error
      router.push('/login')
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2 rounded-xl hover:bg-muted/50 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#c24141] text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold">{user?.name || 'User'}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>
           <div className="flex flex-col">
              <span className="font-semibold">{user?.name}</span>
              <span className="text-xs text-muted-foreground font-normal truncate">{user?.email}</span>
           </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer font-medium"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
