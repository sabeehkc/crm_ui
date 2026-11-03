'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useListProjectsQuery } from '@/store/services/projectSlice'
import { useCreateInvoiceMutation } from '@/store/services/transactionSlice'
import { Loader2 } from 'lucide-react'

export function GenerateInvoiceModal({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: projectsRes } = useListProjectsQuery({ limit: 100 }, { skip: !open })
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation()

  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  const projects = projectsRes?.data?.items || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return
    
    const selectedProj = projects.find(p => p._id === projectId)
    const clientName = selectedProj?.client || 'N/A'

    try {
      await createInvoice({
        projectId,
        client: clientName,
        totalAmount: Number(amount),
        receivedAmount: Number(receivedAmount),
        dueDate: dueDate || undefined,
        issuedDate: new Date().toISOString(),
      }).unwrap()
      onOpenChange(false)
      setProjectId('')
      setAmount('')
      setReceivedAmount('')
      setDueDate('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Generate Invoice</DialogTitle>
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
              <label className="text-sm font-medium text-muted-foreground">Total Amount (₹)</label>
              <Input 
                required
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter invoice total" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Received Amount (₹)</label>
              <Input 
                required
                type="number" 
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="Enter received amount" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              <Input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg text-muted-foreground" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm min-w-[140px]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
