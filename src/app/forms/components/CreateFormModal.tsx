'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Globe, Tag, Mail, Loader2 } from 'lucide-react'
import { useCreateFormMutation } from '@/store/services/formSlice'

interface CreateFormModalProps {
  onFormCreated: (form: any) => void
  isShareForm?: boolean
  children: React.ReactNode
}

export function CreateFormModal({ onFormCreated, isShareForm, children }: CreateFormModalProps) {
  const [createForm, { isLoading }] = useCreateFormMutation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  const handleAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && emailInput.trim()) {
      e.preventDefault()
      const newEmail = emailInput.trim().replace(',', '')
      if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        if (!emails.includes(newEmail)) {
          setEmails([...emails, newEmail])
        }
        setEmailInput('')
      }
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || emails.length === 0) return

    try {
      const res = await createForm({
        name,
        domain,
        notificationEmails: emails,
        isShareForm: isShareForm || false,
      }).unwrap()

      if (onFormCreated) onFormCreated(res.data)
      
      // Reset Form
      setName('')
      setDomain('')
      setEmails([])
      setEmailInput('')
      setOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
        <div className="bg-muted/30 px-6 py-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Form</DialogTitle>
            <DialogDescription>
              Set up a new endpoint to collect submissions immediately.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Form Name
            </Label>
            <div className="relative">
               <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 id="name" 
                 placeholder="e.g. Landing Page Contact" 
                 className="rounded-xl pl-9 border-border/60 focus-visible:ring-primary" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
               />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-semibold text-foreground">
              Restricted Domain <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="relative">
               <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 id="domain" 
                 placeholder="e.g. example.com" 
                 className="rounded-xl pl-9 border-border/60" 
                 value={domain}
                 onChange={(e) => setDomain(e.target.value)}
               />
            </div>
            <p className="text-xs text-muted-foreground pl-1">Leave blank if using only the Public Hosted Form.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emails" className="text-sm font-semibold text-foreground">
              Notification Emails
            </Label>
            <div className="min-h-[44px] flex flex-wrap items-center gap-2 p-2 border rounded-xl border-border/60 bg-white dark:bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
              {emails.map((email) => (
                <Badge 
                  key={email} 
                  variant="secondary" 
                  className="rounded-lg py-1 px-2 text-xs flex items-center gap-1 bg-muted font-medium"
                >
                  <Mail className="h-3 w-3 opacity-70" />
                  {email}
                  <button 
                    type="button" 
                    onClick={() => removeEmail(email)}
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="emails"
                placeholder={emails.length === 0 ? "Enter email and press comma or enter" : "Add more..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleAddEmail}
                onBlur={() => {
                   // Attempt to auto-add on blur if valid
                   if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
                      const newEmail = emailInput.trim()
                      if (!emails.includes(newEmail)) setEmails([...emails, newEmail])
                      setEmailInput('')
                   }
                }}
              />
            </div>
            {emails.length === 0 && (
               <p className="text-xs text-red-500 pl-1">Please enter at least one email address.</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t mt-2 gap-2">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="rounded-xl shadow-sm bg-primary px-6 min-w-[160px]"
              disabled={!name || emails.length === 0 || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Generate Endpoint Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
