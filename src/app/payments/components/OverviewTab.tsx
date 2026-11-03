import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash, Edit3, Loader2 } from 'lucide-react'
import { useGetPaymentOverviewQuery } from '@/store/services/transactionSlice'

const getStatusColor = (received: number, total: number) => {
  if (received >= total && total > 0) return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50"
  if (received > 0) return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50"
  return "text-[#c24141] bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50"
}

const getStatusText = (received: number, total: number) => {
  if (received >= total && total > 0) return "Paid"
  if (received > 0) return "Partial"
  return "Pending"
}

export function OverviewTab() {
  const { data: res, isLoading } = useGetPaymentOverviewQuery()
  const overviewData = res?.data || []

  const totalOutstanding = overviewData.reduce((sum, item) => sum + (item.outstandingAmount || 0), 0)

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#c24141]" /></div>

  return (
    <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-muted/30">
        <h3 className="font-bold text-foreground">Payment Status by Project</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f4f6fb] dark:bg-slate-900">
            <TableRow className="border-b border-muted/30 hover:bg-transparent">
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Client</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Project</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Total Amount</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Received</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Outstanding</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Last Invoice</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Count</TableHead>
              <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overviewData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No data available.</TableCell>
              </TableRow>
            ) : overviewData.map((row, idx) => (
              <TableRow key={idx} className="border-b border-muted/20 hover:bg-muted/10 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#c24141]`}>
                      {row.client?.charAt(0) || 'C'}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.client || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-[13px] text-muted-foreground font-medium">{row.projectName || 'Untitled'}</TableCell>
                <TableCell className="px-6 py-4 text-[13px] font-bold text-foreground">₹{row.totalAmount.toLocaleString()}</TableCell>
                <TableCell className="px-6 py-4 text-[13px] font-bold text-green-500">₹{row.receivedAmount.toLocaleString()}</TableCell>
                <TableCell className="px-6 py-4 text-[13px] font-bold text-[#c24141]">₹{row.outstandingAmount.toLocaleString()}</TableCell>
                <TableCell className="px-6 py-4 text-[13px] text-muted-foreground">{row.lastInvoiceDate ? new Date(row.lastInvoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                <TableCell className="px-6 py-4 text-[13px] text-muted-foreground">{row.invoiceCount} bills</TableCell>
                <TableCell className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(row.receivedAmount, row.totalAmount)}`}>
                    {getStatusText(row.receivedAmount, row.totalAmount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/20 flex items-center justify-between m-4 rounded-xl">
        <div>
          <p className="text-[#c24141] font-bold text-[15px]">Total Outstanding: ₹{totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-[#c24141]/70">Across {overviewData.length} projects</p>
        </div>
        <Button className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white shadow-sm h-9 px-4 font-semibold text-xs border-none">
          Send Reminders
        </Button>
      </div>
    </Card>
  )
}
