'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, FileText, Loader2, CalendarCheck } from 'lucide-react'
import { IEnquiry } from '@/types/enquiry'
import { useUpdateEnquiryMutation } from '@/store/services/enquirySlice'

interface ScheduleFollowupModalProps {
  enquiry: IEnquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const ScheduleFollowupModal = ({ enquiry, open, onOpenChange, onSuccess }: ScheduleFollowupModalProps) => {
  const [updateEnquiry, { isLoading }] = useUpdateEnquiryMutation()
  
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0]
      setDate(today)
      setNotes('')
      setTime('10:00')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiry?._id) return

    try {
      // Combine existing notes with the schedule info
      const scheduleNote = `[Scheduled Followup for ${date} at ${time}]${notes ? `: ${notes}` : ''}`
      const updatedNotes = enquiry.notes ? `${enquiry.notes}\n${scheduleNote}` : scheduleNote

      await updateEnquiry({
        id: enquiry._id,
        data: { 
          status: 'Followup',
          notes: updatedNotes,
          followupDate: new Date(date),
          followupTime: time
        }
      }).unwrap()

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to schedule followup:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden shadow-xl border-none">
        <div className="bg-muted/30 px-6 py-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                <CalendarCheck className="h-5 w-5" />
              </span>
              Schedule Followup
            </DialogTitle>
            <DialogDescription className="mt-1.5">
              Set a reminder date and time to reach out to <span className="font-semibold text-foreground">{enquiry?.name}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" /> Date
              </Label>
              <Input 
                id="date" 
                type="date" 
                className="rounded-xl shadow-sm focus-visible:ring-blue-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Time
              </Label>
              <Input 
                id="time" 
                type="time" 
                className="rounded-xl shadow-sm focus-visible:ring-blue-500"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> Internal Notes
            </Label>
            <Textarea 
              id="notes" 
              placeholder="Briefly explain the context of the followup..." 
              className="rounded-xl min-h-[100px] resize-none shadow-sm focus-visible:ring-blue-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...</>
              ) : (
                "Save Schedule"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
