'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, FileText, Calendar, Check, X, Pencil, Loader2 } from 'lucide-react'
import { getInitials, getStatusColor } from './mockData'
import { EnquiryFormModal } from './EnquiryFormModal'
import { QuickQuotationModal } from './QuickQuotationModal'
import { ScheduleFollowupModal } from './ScheduleFollowupModal'
import { useListEnquiriesQuery, useUpdateEnquiryMutation } from '@/store/services/enquirySlice'
import { useRouter } from 'next/navigation'
import { IEnquiry, EnquiryStatus } from '@/types/enquiry'

export const EnquiriesTable = ({ title, type }: { title: string, type: 'Normal' | 'Sales' }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data: enquiryData, isLoading, error } = useListEnquiriesQuery({
    page,
    limit: 20,
    search: searchTerm,
    status: statusFilter === 'All Status' ? '' : statusFilter,
    type
  })

  const [updateEnquiry] = useUpdateEnquiryMutation()

  const [selectedEnquiry, setSelectedEnquiry] = useState<IEnquiry | null>(null)
  const [editEnquiry, setEditEnquiry] = useState<IEnquiry | null>(null)
  const [quickQuoteEnquiry, setQuickQuoteEnquiry] = useState<IEnquiry | null>(null)
  const [scheduleEnquiry, setScheduleEnquiry] = useState<IEnquiry | null>(null)

  const handleStatusUpdate = async (enquiry: IEnquiry, status: EnquiryStatus) => {
    if (!enquiry._id) return
    try {
      const updateData: Partial<IEnquiry> = { status }
      const now = new Date()
      if (status === 'Converted') updateData.convertedDate = now
      if (status === 'Rejected') updateData.rejectedDate = now
      if (status === 'Quotation Sent') updateData.quotationSentDate = now
      if (status === 'Revised Quotation') updateData.revisedQuotationDate = now

      await updateEnquiry({ id: enquiry._id, data: updateData }).unwrap()
      setSelectedEnquiry(prev => prev ? { ...prev, ...updateData } : null)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const enquiries = enquiryData?.data?.items || []

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-white dark:bg-card pb-4 pt-4 px-6">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex space-x-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <Input 
            placeholder="Search..." 
            className="w-full sm:w-[250px] bg-muted/50 dark:bg-input rounded-lg" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="flex h-10 w-[140px] items-center justify-between rounded-lg border border-input bg-white dark:bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Followup">Followup</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Converted">Converted</option>
            <option value="Rejected">Rejected</option>
            <option value="Revised Quotation">Revised Quotation</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0 min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load enquiries. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-0">
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6">Name</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6">Contact</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6">Service</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6">Date</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6">Status</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4 px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No enquiries found.</TableCell>
                   </TableRow>
                ) : enquiries.map((enq) => (
                  <TableRow 
                    key={enq._id} 
                    className="hover:bg-muted/10 border-b-muted/50 cursor-pointer"
                    onClick={() => setSelectedEnquiry(enq)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-yellow-400 text-white font-semibold">{getInitials(enq.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{enq.name}</div>
                          <div className="text-xs text-muted-foreground">{enq.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground text-sm">{enq.phone}</TableCell>
                    <TableCell className="px-6 py-4 text-sm font-medium">{enq.service}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground text-sm" suppressHydrationWarning>
                       {enq.date ? new Date(enq.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className={`${getStatusColor(enq.status)} border-transparent px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                        {enq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); router.push(`/chat?enquiryId=${enq._id}`); }}><MessageSquare className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setEditEnquiry(enq); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setSelectedEnquiry(enq); }}><FileText className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {enquiryData?.data && enquiryData.data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, enquiryData.data.total)}</span> of <span className="font-medium">{enquiryData.data.total}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm font-medium px-2">
                 Page {page} of {enquiryData.data.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= enquiryData.data.totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Detail Modal */}
      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader className="px-2 pt-2">
            <DialogTitle className="text-xl">Enquiry Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprehensive information about the selected enquiry.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="grid gap-6 py-2">
              <div className="flex items-center space-x-4 p-4 bg-muted/40 rounded-xl">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-yellow-400 text-white text-xl font-bold">{getInitials(selectedEnquiry.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{selectedEnquiry.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedEnquiry.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedEnquiry.phone}</p>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium text-muted-foreground text-sm">Service</span>
                  <span className="text-sm font-medium">{selectedEnquiry.service}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium text-muted-foreground text-sm">Enquiry Date</span>
                  <span className="text-sm" suppressHydrationWarning>
                     {selectedEnquiry.date ? new Date(selectedEnquiry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                {selectedEnquiry.followupDate && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Followup Date</span>
                    <span className="text-sm" suppressHydrationWarning>
                       {new Date(selectedEnquiry.followupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {selectedEnquiry.followupTime && `at ${selectedEnquiry.followupTime}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium text-muted-foreground text-sm">Status</span>
                  <div>
                    <Badge variant="outline" className={`${getStatusColor(selectedEnquiry.status)} border-transparent rounded-full px-3 py-1`}>{selectedEnquiry.status}</Badge>
                  </div>
                </div>
                {selectedEnquiry.quotationSentDate && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Quotation Sent Date</span>
                    <span className="text-sm" suppressHydrationWarning>
                       {new Date(selectedEnquiry.quotationSentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {selectedEnquiry.convertedDate && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Converted Date</span>
                    <span className="text-sm" suppressHydrationWarning>
                       {new Date(selectedEnquiry.convertedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {selectedEnquiry.rejectedDate && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Rejected Date</span>
                    <span className="text-sm" suppressHydrationWarning>
                       {new Date(selectedEnquiry.rejectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {selectedEnquiry.rejectReason && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Reject Reason</span>
                    <span className="text-sm">
                       {selectedEnquiry.rejectReason}
                    </span>
                  </div>
                )}
                {selectedEnquiry.revisedQuotationDate && (
                  <div className="flex justify-between items-center border-b pb-3 mt-3">
                    <span className="font-medium text-muted-foreground text-sm">Revised Quotation Date</span>
                    <span className="text-sm" suppressHydrationWarning>
                       {new Date(selectedEnquiry.revisedQuotationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-start pb-2">
                  <span className="font-medium text-muted-foreground text-sm w-1/3">Notes</span>
                  <span className="text-sm text-right leading-relaxed w-2/3">{selectedEnquiry.notes || 'None'}</span>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <h4 className="text-sm font-medium text-muted-foreground">Update Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => {
                       setScheduleEnquiry(selectedEnquiry)
                       setSelectedEnquiry(null)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Followup
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    // onClick={() => {
                    //     setQuickQuoteEnquiry(selectedEnquiry)
                    //     setSelectedEnquiry(null) // Close this modal to open quick quote
                    //  }}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Send Quotation
                  </Button>
                  <Button 
                    className="w-full justify-start bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    onClick={() => handleStatusUpdate(selectedEnquiry, 'Converted')}
                  >
                    <Check className="mr-2 h-4 w-4" /> Mark Converted
                  </Button>
                  <Button 
                    className="w-full justify-start bg-red-500 hover:bg-red-600 text-white rounded-xl"
                    onClick={() => handleStatusUpdate(selectedEnquiry, 'Rejected')}
                  >
                    <X className="mr-2 h-4 w-4" /> Mark Rejected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editEnquiry && (
        <EnquiryFormModal 
          open={!!editEnquiry} 
          onOpenChange={(open) => !open && setEditEnquiry(null)} 
          enquiry={editEnquiry} 
        />
      )}

      {/* Quick Quotation Modal */}
      <QuickQuotationModal 
        open={!!quickQuoteEnquiry}
        onOpenChange={(open) => !open && setQuickQuoteEnquiry(null)}
        enquiry={quickQuoteEnquiry}
        onSuccess={() => {
          // Any cleanup or refresh could happen here, the queries invalidate automatically 
        }}
      />

      {/* Schedule Followup Modal */}
      <ScheduleFollowupModal 
        open={!!scheduleEnquiry}
        onOpenChange={(open) => !open && setScheduleEnquiry(null)}
        enquiry={scheduleEnquiry}
        onSuccess={() => {
           // Automatic re-fetch 
        }}
      />
    </Card>
  )
}
