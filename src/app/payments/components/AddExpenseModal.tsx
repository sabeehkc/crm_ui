'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useListProjectsQuery } from '@/store/services/projectSlice'
import { useCreateTransactionMutation } from '@/store/services/transactionSlice'
import { Loader2 } from 'lucide-react'
import toast from "react-hot-toast"

export function AddExpenseModal({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
   const { data: projectsRes } = useListProjectsQuery({ limit: 100 }, { skip: !open })
   const [createTransaction, { isLoading }] = useCreateTransactionMutation()
  
   const [projectId, setProjectId] = useState('')
   const [amount, setAmount] = useState('')
   const [date, setDate] = useState(new Date().toISOString().split('T')[0])
   const [mode, setMode] = useState('bank')
   const [category, setCategory] = useState('operations')
   const [description, setDescription] = useState('')
   const [proof, setProof] = useState<File | null>(null)

 const projects = projectsRes?.data?.items || []

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!projectId) {
     toast.error('Please select a project');
     return;
   }
   
   const selectedProj = projects.find(p => p._id === projectId)
   const clientName = selectedProj?.client || 'Internal'

   const formData = new FormData()
   formData.append('projectId', projectId)
   formData.append('client', clientName)
   formData.append('amount', amount)
   formData.append('date', date)
   formData.append('mode', mode)
   formData.append('type', 'expense')
   formData.append('category', category)
   if (description) formData.append('description', description)
   if (proof) formData.append('paymentProof', proof) // Backend requires paymentProof fieldname for all transactions

   try {
     await createTransaction(formData).unwrap()
     toast.success("Expense recorded successfully!");
     onOpenChange(false)
     setProjectId('')
     setAmount('')
     setDescription('')
     setProof(null)
   } catch (err) {
     console.error(err)
     toast.error("Failed to save expense record.");
   }
 }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl">
        <DialogHeader className='border-b p-2'>
          <DialogTitle className="text-xl font-bold">Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <select 
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer text-muted-foreground"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <Input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cloud hosting, license..." className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
            <Input required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" type="number" className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Date</label>
            <Input required value={date} onChange={(e) => setDate(e.target.value)} type="date" className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer">
              <option value="infrastructure">Infrastructure</option>
              <option value="software">Software</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Mode</label>
            <select required value={mode} onChange={(e) => setMode(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer">
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Proof (optional)</label>
            <Input type="file" onChange={(e) => setProof(e.target.files?.[0] || null)} className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg py-2" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
          <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm min-w-[120px]">
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Expense'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
