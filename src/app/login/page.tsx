'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLoginMutation } from '@/store/services/authSlice'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from "../../../public/crm-logo.png"

export default function LoginPage() {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    try {
      const res = await login(formData).unwrap()
      if (res.success) {
        toast.success(res.message || 'Login successful!')
        router.push('/')
      } else {
        setErrorMsg(res.message || 'Failed to login')
        toast.error(res.message || 'Failed to login')
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'An unexpected error occurred during login.')
      toast.error(err?.data?.message || 'An unexpected error occurred during login.')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[60%] bg-red-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center mb-2">
          <div className="h-12 w-12 rounded-2xl shadow-lg flex items-center justify-center mb-4">
             <img
            src={logo.src}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-contain"
          />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your credentials to access your CRM workspace
          </p>
        </div>

        <Card className="w-full border-border/40 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your dashboard & enterprise features
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-0">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                   <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="email" 
                     type="email" 
                     placeholder="admin@example.com" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     required
                   />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-[#c24141] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                   <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="password" 
                     type="password" 
                     placeholder="••••••••" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.password}
                     onChange={(e) => setFormData({...formData, password: e.target.value})}
                     required
                   />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 pb-8 px-8">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#c24141] hover:bg-[#a63535] text-white h-11 rounded-xl text-base font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sign In...</>
                ) : (
                  <><span className="mr-1">Log In Dashboard</span> <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-2">
                 Don't have an account yet?{" "}
                 <Link href="/register" className="text-[#c24141] hover:underline font-semibold">
                   Sign Up
                 </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
