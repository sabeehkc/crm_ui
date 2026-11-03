'use client'

import React, { useEffect } from 'react'
import { Sidebar, menuItems } from './Sidebar'
import { Navbar } from './Navbar'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Loader2, ShieldCheck } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isInitialized, user } = useSelector((state: RootState) => state.auth)

  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router, mounted])

  // Show loader while verifying auth session or until mounted on client
  if (!mounted || !isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col gap-3 items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-[#c24141]" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Verifying session...</p>
      </div>
    )
  }

  // Prevent flash of protected content if not logged in and about to redirect
  if (!isAuthenticated) {
    return null
  }

  const isAccessGranted = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const currentMenuItem = menuItems.find(item => 
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    );

    if (!currentMenuItem) return true; // Let them access unknown pages

    return user.pages?.includes(currentMenuItem.id) || false;
  }

  if (!isAccessGranted()) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 p-6 flex flex-col items-center justify-center">
             <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 mb-2 opacity-50" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="mt-1 font-medium">You don't have permission to view this page.</p>
             </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
