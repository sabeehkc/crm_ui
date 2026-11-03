import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileDigit, Loader2, ExternalLink } from 'lucide-react'
import { useListTransactionsQuery } from '@/store/services/transactionSlice'
import { BASE_URL } from '@/store/constants'

export function TransactionsTab() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { data: res, isLoading } = useListTransactionsQuery({ page, limit })
  const transactions = res?.data?.items || []
  const pagination = res?.data

  return (
    <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-muted/30 flex items-center justify-between">
        <h3 className="font-bold text-foreground px-1">All Payments</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input type="date" className="h-9 rounded-lg bg-transparent border-muted/50 text-sm pl-3 pr-3 text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-[#f4f6fb] dark:bg-slate-900">
          <TableRow className="border-b border-muted/30 hover:bg-transparent">
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Date</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Type</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Client/Vendor</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Description</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Project</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Amount</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Mode</TableHead>
            <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Proof</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
             <TableRow>
               <TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c24141]" /></TableCell>
             </TableRow>
          ) : transactions.length === 0 ? (
             <TableRow>
               <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No transactions found.</TableCell>
             </TableRow>
          ) : transactions.map((tx) => (
            <TableRow key={tx._id} className="border-b border-muted/20 hover:bg-muted/10 transition-colors">
              <TableCell className="px-6 py-4 text-[13px] text-muted-foreground font-medium">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
              <TableCell className="px-6 py-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tx.type === 'expense' ? 'border-red-200 text-red-600 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' : 'border-green-200 text-green-600 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20'}`}>
                  {tx.type === 'expense' ? 'Expense' : 'Received'}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 text-[13px] font-medium text-foreground">{tx.client}</TableCell>
              <TableCell className="px-6 py-4 text-[13px] text-muted-foreground">{tx.notes || 'Payment'}</TableCell>
              <TableCell className="px-6 py-4 text-[13px] text-muted-foreground">{typeof tx.projectId === 'object' ? tx.projectId?.name : 'Project'}</TableCell>
              <TableCell className="px-6 py-4 text-[13px] font-bold">
                <span className={tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                  {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 text-[13px] text-muted-foreground capitalize">{tx.mode.replace('_', ' ')}</TableCell>
              <TableCell className="px-6 py-4">
                {tx.proofDocument ? (
                  <a href={`${BASE_URL}/${tx.proofDocument}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground hover:underline cursor-pointer">
                    <FileDigit className="w-3.5 h-3.5 text-muted-foreground" /> View
                  </a>
                ) : (
                  <span className="text-[12px] text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-muted/30 flex items-center justify-between bg-card">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-bold">{(page - 1) * limit + 1}</span> to <span className="font-bold">{Math.min(page * limit, pagination.total)}</span> of <span className="font-bold">{pagination.total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 rounded-lg p-0 ${page === i + 1 ? 'bg-[#c24141] hover:bg-[#a63636]' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
