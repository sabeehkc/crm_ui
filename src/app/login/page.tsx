'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useLoginMutation, useGoogleLoginMutation } from '@/store/services/authSlice'
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
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation()
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const initializeGoogleSignIn = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
        console.log('Initializing Google Sign-In with client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
          callback: handleGoogleSignInResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: 380, shape: 'rectangular' }
        );
      } catch (err) {
        console.error('Error initializing Google Sign-In:', err);
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      initializeGoogleSignIn()
    }
  }, [])

  const handleGoogleSignInResponse = async (response: any) => {
    setErrorMsg('')
    try {
      const res = await googleLogin({ credential: response.credential }).unwrap()
      if (res.success) {
        toast.success(res.message || 'Login successful!')
        router.push('/')
      } else {
        setErrorMsg(res.message || 'Failed to login with Google')
        toast.error(res.message || 'Failed to login with Google')
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Google authentication failed.')
      toast.error(err?.data?.message || 'Google authentication failed.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    try {
      const res = await login(formData).unwrap()
      if (res.success) {
        toast.success(res.message)
        router.push('/') // Or redirect to appropriate route after login
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
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground text-sm">Secure Access Portal</p>
        </div>

        <Card className="w-full border-none shadow-2xl shadow-slate-200 dark:shadow-black rounded-3xl backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
          <CardHeader className="space-y-1 pt-8 px-8">
            <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
            <CardDescription>Enter your email and password to enter the dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-5 px-8">
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl font-medium flex items-center">
                  {errorMsg}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                   <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="email" 
                     type="email" 
                     placeholder="admin@crm.com" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     required
                   />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                   <Label htmlFor="password">Password</Label>
                   <Link href="#" className="text-xs text-[#c24141] hover:underline font-medium">Forgot Password?</Link>
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
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#c24141] hover:bg-[#a63535] text-white h-11 rounded-xl text-base font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sign In...</>
                ) : (
                  <><span className="mr-1">Log In Dashboard</span> <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>

              <div className="relative w-full my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center py-2 text-sm text-muted-foreground font-medium">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#c24141]" />
                    Verifying Google account...
                  </div>
                ) : (
                  <div id="google-signin-btn" className="w-full flex justify-center" />
                )}
              </div>

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

      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={initializeGoogleSignIn}
        onReady={initializeGoogleSignIn}
        strategy="lazyOnload"
      />
    </div>
  )
}
