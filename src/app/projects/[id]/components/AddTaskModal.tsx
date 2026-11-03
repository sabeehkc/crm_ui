'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTaskMutation, useGetProjectDetailsQuery } from '@/store/services/projectSlice'
import { Loader2 } from 'lucide-react'
import { IUser } from '@/types/user'

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  milestoneId: string
  milestoneName?: string
}

export function AddTaskModal({ open, onOpenChange, projectId, milestoneId, milestoneName }: AddTaskModalProps) {
  const [createTask, { isLoading }] = useCreateTaskMutation()
  const { data: projectRes } = useGetProjectDetailsQuery(projectId, { skip: !projectId || !open })
  
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<'Pending'|'In Progress'|'Done'>('Pending')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !milestoneId) return
    try {
      await createTask({
        projectId,
        milestoneId,
        data: { title, dueDate, status }
      }).unwrap()
      setTitle('')
      setDueDate('')
      setStatus('Pending')
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Task {milestoneName ? `to ${milestoneName}` : ''}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new task and set a deadline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Task Description</label>
              <Textarea 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?" 
                className="bg-input border-transparent focus-visible:ring-1 min-h-[80px] resize-none rounded-lg" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <Input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg block w-full text-muted-foreground" 
                />
              </div>
              <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer text-muted-foreground"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            </div>
            
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm px-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

