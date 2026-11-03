import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Send, FileUp, Loader2 } from 'lucide-react'
import { InvoicePreviewModal } from './InvoicePreviewModal'
import { useListInvoicesQuery, useUpdateInvoiceReceivedAmountMutation } from '@/store/services/transactionSlice'

const getInvoiceStatusStyle = (status: string) => {
  if (status === 'Paid') return "text-green-600 bg-green-50 dark:bg-green-900/20"
  if (status === 'Partial') return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
  return "text-[#c24141] bg-red-50 dark:bg-red-900/20"
}

export function BillsTab() {
  const { data: res, isLoading } = useListInvoicesQuery({ limit: 100 })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<any>(null)

  const bills = res?.data?.items || []

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#c24141]" /></div>

  if (bills.length === 0) return <div className="bg-muted/20 rounded-xl p-10 text-center text-muted-foreground border-2 border-dashed">No invoices found. Click Generate Bill above.</div>

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((bill) => {
          const outstanding = Math.max(0, bill.totalAmount - bill.receivedAmount)
          const progress = Math.min(100, (bill.receivedAmount / bill.totalAmount) * 100)
          return (
            <Card key={bill._id} className="bg-card border-none rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-[15px] text-foreground mb-0.5">{bill.invoiceNumber}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{bill.client} • {typeof bill.projectId === 'object' ? bill.projectId.name : 'Project'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${getInvoiceStatusStyle(bill.status)}`}>{bill.status}</span>
              </div>
              
            <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Total</p>
                  <p className="font-bold text-foreground text-lg">₹{bill.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Outstanding</p>
                  <p className={`font-bold text-lg ${outstanding === 0 ? 'text-green-500' : 'text-[#c24141]'}`}>₹{outstanding.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden mb-5 flex">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1 rounded-lg h-9 bg-transparent border-muted/50 text-xs font-semibold shadow-sm hover:bg-muted/30">
                  <Eye className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> View
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedBill(bill)
                    setPreviewOpen(true)
                  }}
                  className="flex-1 rounded-lg h-9 bg-[#c24141] hover:bg-[#a63636] border-none text-white text-xs font-semibold shadow-sm"
                >
                  <FileUp className="w-3.5 h-3.5 mr-1.5" /> PDF
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <InvoicePreviewModal 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        bill={selectedBill} 
      />
    </>
  )
}
