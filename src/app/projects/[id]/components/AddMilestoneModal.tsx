'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateMilestoneMutation, useUpdateMilestoneMutation } from '@/store/services/projectSlice'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface AddMilestoneModalProps {
  projectId: string
  open: boolean
  onOpenChange: (o: boolean) => void
  milestoneToEdit?: { id: string, title: string, dueDate: string, status: string } | null
}

export function AddMilestoneModal({ projectId, open, onOpenChange, milestoneToEdit }: AddMilestoneModalProps) {
  const [createMilestone, { isLoading: isCreating }] = useCreateMilestoneMutation()
  const [updateMilestone, { isLoading: isUpdating }] = useUpdateMilestoneMutation()
  
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'done'>('pending')

  useEffect(() => {
    if (open) {
      if (milestoneToEdit) {
        setTitle(milestoneToEdit.title)
        setDueDate(milestoneToEdit.dueDate.split('T')[0])
        setStatus(milestoneToEdit.status as any)
      } else {
        setTitle('')
        setDueDate('')
        setStatus('pending')
      }
    }
  }, [open, milestoneToEdit])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return
    try {
      if (milestoneToEdit) {
        await updateMilestone({
          projectId,
          milestoneId: milestoneToEdit.id,
          data: { title, dueDate, status }
        }).unwrap()
      } else {
        await createMilestone({
          id: projectId,
          data: { title, dueDate, status }
        }).unwrap()
      }
      setTitle('')
      setDueDate('')
      setStatus('pending')
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{milestoneToEdit ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Milestone Title</label>
              <Input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend Development" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              <Input 
                required
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm px-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {milestoneToEdit ? 'Save Changes' : 'Add Milestone'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

