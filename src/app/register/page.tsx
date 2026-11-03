'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRegisterMutation } from '@/store/services/authSlice'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, User, Lock, Mail, ArrowRight, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from "../../../public/crm-logo.png"

export default function RegisterPage() {
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password
      }).unwrap()

      if (res.success) {
        toast.success(res.message || 'Registration successful!')
        router.push('/')
      } else {
        setErrorMsg(res.message || 'Registration failed')
        toast.error(res.message || 'Registration failed')
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'An unexpected error occurred during registration.')
      toast.error(err?.data?.message || 'An unexpected error occurred during registration.')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-red-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-indigo-400/10 rounded-full blur-3xl" />
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Set up your organization's workspace in seconds
          </p>
        </div>

        <Card className="w-full border-border/40 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Register as an administrator to build your team
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
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <div className="relative">
                   <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="name" 
                     placeholder="John Doe" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     required
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Company / Organization
                </Label>
                <div className="relative">
                   <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="companyName" 
                     placeholder="Acme Corp" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.companyName}
                     onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                     required
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Business Email
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
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                   <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                     id="confirmPassword" 
                     type="password" 
                     placeholder="••••••••" 
                     className="pl-10 rounded-xl h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-[#c24141]"
                     value={formData.confirmPassword}
                     onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                     required
                   />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-4 pb-8 px-8">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#c24141] hover:bg-[#a63535] text-white h-11 rounded-xl text-base font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registering...</>
                ) : (
                  <><span className="mr-1">Create Account</span> <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-2">
                 Already registered?{" "}
                 <Link href="/login" className="text-[#c24141] hover:underline font-semibold">
                   Log In
                 </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
