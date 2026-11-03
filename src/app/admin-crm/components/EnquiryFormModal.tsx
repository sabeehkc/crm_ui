'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateEnquiryMutation, useUpdateEnquiryMutation } from '@/store/services/enquirySlice'
import { IEnquiry, EnquiryStatus } from '@/types/enquiry'
import toast from 'react-hot-toast'

interface EnquiryFormModalProps {
  children?: React.ReactNode
  enquiry?: IEnquiry // If provided, it's edit mode
  open?: boolean
  type?: 'Normal' | 'Sales'
  onOpenChange?: (open: boolean) => void
}

export const EnquiryFormModal = ({ children, enquiry, type, open: controlledOpen, onOpenChange }: EnquiryFormModalProps) => {
  const isEdit = !!enquiry
  const [localOpen, setLocalOpen] = useState(false)
  
  // Determine if it is controlled by outside props
  const isControlled = typeof controlledOpen !== 'undefined'
  const open = isControlled ? controlledOpen : localOpen

  const handleOpenChange = (val: boolean) => {
    if (!isControlled) {
      setLocalOpen(val)
    }
    onOpenChange?.(val)
  }

  const [createEnquiry, { isLoading: isCreating }] = useCreateEnquiryMutation()
  const [updateEnquiry, { isLoading: isUpdating }] = useUpdateEnquiryMutation()

  const [formData, setFormData] = useState<Partial<IEnquiry>>({
    name: '',
    email: '',
    phone: '',
    service: '',
    status: 'New',
    type: type || 'Normal',
    notes: '',
    date: undefined
  })

  useEffect(() => {
    if (enquiry) {
      setFormData({
        ...enquiry,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        status: 'New',
        type: type || 'Normal',
        notes: '',
        date: new Date()
      })
    }
  }, [enquiry, open])

  const handleSubmit = async () => {
    try {
      if (isEdit && enquiry?._id) {
        await updateEnquiry({ id: enquiry._id, data: formData }).unwrap()
        toast.success('Enquiry updated successfully')
      } else {
        await createEnquiry(formData).unwrap()
        toast.success('Enquiry created successfully')
      }
      handleOpenChange(false) // Correctly close whether controlled or not
    } catch (error) {
      console.error('Failed to submit enquiry form:', error)
      toast.error('Failed to submit enquiry form')
    }
  }

  const isLoading = isCreating || isUpdating

  const getHtmlDate = (date?: string | Date) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  const defaultDateValue = getHtmlDate(formData.date)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader className="px-2 pt-2">
          <DialogTitle className="text-xl">{isEdit ? 'Edit Enquiry' : 'New Enquiry'}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit ? 'Update the details of the existing enquiry.' : 'Fill in the form below to add a new enquiry to the CRM.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 px-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name" 
              className="rounded-lg bg-muted/30" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-muted-foreground">Email</label>
               <Input 
                 value={formData.email} 
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 placeholder="Email" 
                 className="rounded-lg bg-muted/30" 
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-muted-foreground">Phone</label>
               <Input 
                 value={formData.phone} 
                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                 placeholder="Phone" 
                 className="rounded-lg bg-muted/30" 
               />
             </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Service</label>
            <Input 
              value={formData.service} 
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="e.g. Website Development" 
              className="rounded-lg bg-muted/30" 
            />
          </div>
          <div className="space-y-1.5">
               <label className="text-xs font-medium text-muted-foreground">Type</label>
               <select 
                 value={formData.type}
                 onChange={(e) => setFormData({ ...formData, type: e.target.value as IEnquiry['type'] })}
                 className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
               >
                 <option value=''>Select Type</option>
                 <option value='Normal'>Normal</option>
                 <option value='Sales'>Sales</option>
               </select>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-muted-foreground">Date</label>
               <Input 
                 type="date" 
                 value={defaultDateValue} 
                 onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                 className="rounded-lg bg-muted/30 block w-full" 
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-muted-foreground">Status</label>
               <select 
                 value={formData.status}
                 onChange={(e) => setFormData({ ...formData, status: e.target.value as EnquiryStatus })}
                 className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
               >
                 <option value='New'>New</option>
                 <option value='Followup'>Followup</option>
                 <option value='Quotation Sent'>Quotation Sent</option>
                 <option value='Converted'>Converted</option>
                 <option value='Rejected'>Rejected</option>
                 <option value='Revised Quotation'>Revised Quotation</option>
               </select>
             </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea 
               value={formData.notes} 
               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
               placeholder="Basic details about the enquiry..." 
               className="flex min-h-[80px] w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t mt-2">
            <Button variant="outline" className="rounded-lg" onClick={() => handleOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-[#c24141] hover:bg-[#a63535] text-white rounded-lg"
            >
              {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Enquiry')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
