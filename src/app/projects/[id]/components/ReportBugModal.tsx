'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateBugMutation, useUpdateBugMutation } from '@/store/services/projectSlice'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface ReportBugModalProps {
  projectId: string
  open: boolean
  onOpenChange: (o: boolean) => void
  bugToEdit?: any | null
}

export function ReportBugModal({ projectId, open, onOpenChange, bugToEdit }: ReportBugModalProps) {
  const [createBug, { isLoading: isCreating }] = useCreateBugMutation()
  const [updateBug, { isLoading: isUpdating }] = useUpdateBugMutation()
  
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<'Low'|'Medium'|'High'|'Critical'>('Medium')
  const [status, setStatus] = useState<'Open'|'In Progress'|'Resolved'>('Open')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [reporter, setReporter] = useState('')
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    if (open) {
      if (bugToEdit) {
        setTitle(bugToEdit.title)
        setSeverity(bugToEdit.severity)
        setStatus(bugToEdit.status)
        setStepsToReproduce(bugToEdit.stepsToReproduce || '')
        setReporter(bugToEdit.reporter || '')
        setResolution(bugToEdit.resolution || '')
      } else {
        setTitle('')
        setSeverity('Medium')
        setStatus('Open')
        setStepsToReproduce('')
        setReporter('')
        setResolution('')
      }
    }
  }, [open, bugToEdit])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return
    try {
      if (bugToEdit) {
        await updateBug({
          projectId,
          bugId: bugToEdit._id,
          data: { title, severity, status, stepsToReproduce, reporter, resolution }
        }).unwrap()
      } else {
        await createBug({
          id: projectId,
          data: { title, severity, stepsToReproduce, reporter, resolution, status: 'Open' }
        }).unwrap()
      }
      setTitle('')
      setSeverity('Medium')
      setStepsToReproduce('')
      setReporter('')
      setResolution('')
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{bugToEdit ? 'Edit Bug' : 'Report Bug'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Bug Title</label>
              <Input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short description of the error" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Severity</label>
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-lg bg-input border-transparent focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Reporter</label>
              <Input 
                required
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="Reporter Name" className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Steps to Reproduce & Details</label>
              <Textarea 
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder="1. Go to...\n2. Click on..." 
                className="bg-input border-transparent focus-visible:ring-1 min-h-[120px] resize-none rounded-lg" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Resolution Notes</label>
              <Textarea 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution notes..." 
                className="bg-input border-transparent focus-visible:ring-1 min-h-[120px] resize-none rounded-lg" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm px-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {bugToEdit ? 'Save Changes' : 'Submit Bug'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

