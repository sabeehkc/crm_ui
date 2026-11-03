'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { IEnquiry } from '@/types/enquiry'
import { useCreateQuotationMutation } from '@/store/services/quotationSlice'
import { useUpdateEnquiryMutation } from '@/store/services/enquirySlice'
import { ILineItem } from '@/types/quotation'

interface QuickQuotationModalProps {
  enquiry: IEnquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const QuickQuotationModal = ({ enquiry, open, onOpenChange, onSuccess }: QuickQuotationModalProps) => {
  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation()
  const [updateEnquiry, { isLoading: isUpdatingStatus }] = useUpdateEnquiryMutation()

  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { desc: enquiry?.service || 'Service Provision', qty: 1, rate: 0 }
  ])
  const [gstPercent, setGstPercent] = useState(18)

  useEffect(() => {
    if (open && enquiry) {
      setLineItems([
        { desc: enquiry.service || 'Service Provision', qty: 1, rate: 0 }
      ])
    }
  }, [open, enquiry])

  const handleAddItem = () => {
    setLineItems([...lineItems, { desc: '', qty: 1, rate: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, idx) => idx !== index))
    }
  }

  const handleUpdateItem = (index: number, key: keyof ILineItem, val: string | number) => {
    const next = [...lineItems]
    next[index] = { ...next[index], [key]: val }
    setLineItems(next)
  }

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * (Number(item.rate) || 0)), 0)
  const gstAmount = subtotal * (gstPercent / 100)
  const totalAmount = subtotal + gstAmount

  const handleSubmit = async () => {
    if (!enquiry) return

    try {
      // 1. Create Quotation
      const quotePayload = {
        enquiryId: enquiry._id,
        lineItems: lineItems.map(i => ({ ...i, rate: Number(i.rate) })),
        welcomeTitle: `We are pleased to submit this quotation regarding your ${enquiry.service} inquiry.`,
        terms: "Standard 50% advance, balance on completion.",
        timelineItems: [],
        gstPercent,
        companyDetails: {
          name: "CRM Technologies",
          address: "Main Office",
          phone: "+91 000 000 0000",
          email: "support@crm.com"
        },
        clientDetails: {
          name: enquiry.name,
          company: "N/A",
          email: enquiry.email
        },
        quoteMeta: {
          date: new Date().toISOString().split('T')[0],
          validFor: "15 days",
          ref: `QT-${Date.now().toString().substring(7)}`
        }
      }

      await createQuotation(quotePayload).unwrap()

      // 2. Update Enquiry Status to Quotation Sent
      await updateEnquiry({
        id: enquiry._id,
        data: { 
          status: 'Quotation Sent',
          quotationSentDate: new Date()
        }
      }).unwrap()

      // Done
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to generate quick quotation:', error)
    }
  }

  const isLoading = isCreating || isUpdatingStatus

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl border-none shadow-2xl">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            Quick Quotation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create and send a quick quotation to the client based on their enquiry.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Header info */}
          <div className="bg-muted/30 p-3 rounded-xl flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Client Name</span>
              <span className="font-medium">{enquiry?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-xs">Enquiry Service</span>
              <span className="font-medium">{enquiry?.service}</span>
            </div>
          </div>

          {/* Items Array */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Items & Pricing</Label>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="h-8 rounded-lg text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 dark:bg-slate-900 p-3 rounded-xl relative group transition-colors">
                   <div className="col-span-6 space-y-1">
                      <Input 
                        placeholder="Description" 
                        className="h-9 text-sm bg-transparent"
                        value={item.desc}
                        onChange={(e) => handleUpdateItem(idx, 'desc', e.target.value)}
                      />
                   </div>
                   <div className="col-span-2 space-y-1">
                      <Input 
                        type="number" 
                        placeholder="Qty" 
                        className="h-9 text-sm text-center" 
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                      />
                   </div>
                   <div className="col-span-3 space-y-1">
                      <Input 
                        type="number" 
                        placeholder="Rate" 
                        className="h-9 text-sm"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                      />
                   </div>
                   <div className="col-span-1 flex justify-end pt-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between items-start px-1">
             <div className="flex items-center gap-2">
                <Label htmlFor="gst" className="text-xs text-muted-foreground">Tax / GST (%)</Label>
                <Input 
                  id="gst"
                  type="number" 
                  className="w-16 h-7 text-xs text-center" 
                  value={gstPercent} 
                  onChange={e => setGstPercent(parseFloat(e.target.value) || 0)} 
                />
             </div>

             <div className="text-right space-y-1.5">
                <div className="flex justify-end gap-8 text-xs text-muted-foreground">
                   <span>Subtotal</span>
                   <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-8 text-xs text-muted-foreground">
                   <span>Tax ({gstPercent}%)</span>
                   <span className="font-mono">₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-8 text-base font-bold border-t pt-1.5 mt-1.5">
                   <span>Grand Total</span>
                   <span className="text-indigo-600">₹{totalAmount.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              className="flex-2 bg-[#c24141] hover:bg-[#a63535] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Create & Send Quotation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
