'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useListProjectsQuery } from '@/store/services/projectSlice'
import { useCreateTransactionMutation } from '@/store/services/transactionSlice'
import { Loader2 } from 'lucide-react'
import toast from "react-hot-toast";

export function RecordPaymentModal({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: projectsRes } = useListProjectsQuery({ limit: 100 }, { skip: !open })
  const [createTransaction, { isLoading }] = useCreateTransactionMutation()

  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mode, setMode] = useState('bank')
  const [notes, setNotes] = useState('')
  const [proof, setProof] = useState<File | null>(null)

  const projects = projectsRes?.data?.items || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }
    
    const selectedProj = projects.find(p => p._id === projectId)
    const clientName = selectedProj?.client || 'N/A'

    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('client', clientName)
    formData.append('amount', amount)
    formData.append('date', date)
    formData.append('mode', mode)
    formData.append('type', 'payment')
    if (notes) formData.append('notes', notes)
    if (proof) formData.append('paymentProof', proof)

    try {
      await createTransaction(formData).unwrap()
      toast.success("Payment recorded successfully!");
      onOpenChange(false)
      setProjectId('')
      setAmount('')
      setNotes('')
      setProof(null)
    } catch (err) {
      console.error(err)
      toast.error("Failed to save payment record.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Record Payment Received</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
              <Input 
                required
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Input 
                required
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg text-muted-foreground" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Mode</label>
              <select 
                required
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer text-muted-foreground"
              >
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Proof Document</label>
              <Input 
                type="file" 
                onChange={(e) => setProof(e.target.files?.[0] || null)}
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg py-2 text-muted-foreground" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..." 
                className="bg-input border-transparent focus-visible:ring-1 min-h-[80px] resize-none rounded-lg" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm min-w-[120px]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
