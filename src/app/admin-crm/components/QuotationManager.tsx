'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ChevronRight,
  ChevronDown,
  FileText,
  History,
  Plus,
  Calendar,
  User,
  Clock,
  Copy,
  Printer,
  Mail,
  Check,
  X,
  Edit,
  Trash2,
  AlertCircle,
  ArrowRight,
  Loader2,
  DollarSign,
  Layers,
  ArrowUpRight,
  Share2
} from 'lucide-react'
import { useListQuotationsQuery, useCreateQuotationMutation, useUpdateQuotationMutation } from '@/store/services/quotationSlice'
import { IQuotation, ILineItem } from '@/types/quotation'
import toast from 'react-hot-toast'

interface QuotationManagerProps {
  enquiryId: string
  onQuotationChange?: () => void
}

export const QuotationManager = ({ enquiryId, onQuotationChange }: QuotationManagerProps) => {
  // 1. API Queries
  const { data: res, isLoading, refetch } = useListQuotationsQuery({ enquiryId, limit: 100 }, { skip: !enquiryId })
  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation()
  const [updateQuotation, { isLoading: isUpdating }] = useUpdateQuotationMutation()

  // Raw Items from server
  const rawQuotations: IQuotation[] = useMemo(() => res?.data?.items || [], [res])

  // 2. UI State Management
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [expandedRootIds, setExpandedRootIds] = useState<Record<string, boolean>>({})
  
  // Revision Flow State
  const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false)
  const [sourceQuotation, setSourceQuotation] = useState<IQuotation | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')
  
  // Editable state inside Revision Dialog
  const [revLineItems, setRevLineItems] = useState<ILineItem[]>([])
  const [revWelcome, setRevWelcome] = useState('')
  const [revTerms, setRevTerms] = useState('')
  const [revGst, setRevGst] = useState(18)

  // Sync helpers: Expand all root cards by default on initial load
  useEffect(() => {
    if (rawQuotations.length > 0) {
      const expands: Record<string, boolean> = {}
      rawQuotations.forEach(q => {
        if (!q.parentQuotationId && q._id) {
          expands[q._id] = true
        }
      })
      setExpandedRootIds(prev => ({ ...expands, ...prev }))

      // Select latest active quotation by default if none selected
      if (!selectedQuotationId && rawQuotations.length > 0) {
        setSelectedQuotationId(rawQuotations[0]._id || null)
      }
    }
  }, [rawQuotations])

  // 3. Computations & Tree Structuring
  // Group data into main root quotes and nested revision trees
  const { rootQuotes, revisionTree } = useMemo(() => {
    const roots = rawQuotations.filter(q => !q.parentQuotationId)
    const tree: Record<string, IQuotation[]> = {}

    roots.forEach(root => {
      const rid = root._id!
      tree[rid] = rawQuotations
        .filter(q => q.parentQuotationId === rid)
        .sort((a, b) => (b.revisionNumber || 0) - (a.revisionNumber || 0))
    })
    return { rootQuotes: roots, revisionTree: tree }
  }, [rawQuotations])

  // Active Selected Object
  const activeQuotation = useMemo(() => {
    return rawQuotations.find(q => q._id === selectedQuotationId) || null
  }, [rawQuotations, selectedQuotationId])

  // Compute Revision Number Generation
  const getNextRevisionStats = (parentQuote: IQuotation) => {
    const childs = revisionTree[parentQuote._id!] || []
    const highestNum = childs.reduce((acc, curr) => Math.max(acc, curr.revisionNumber || 0), 0)
    const baseNum = parentQuote.revisionNumber || 0
    return Math.max(baseNum, highestNum) + 1
  }

  // 4. Event Handlers
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedRootIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleOpenRevisionModal = (quote: IQuotation) => {
    setSourceQuotation(quote)
    setRevLineItems([...(quote.lineItems || [])])
    setRevWelcome(quote.welcomeTitle || '')
    setRevTerms(quote.terms || '')
    setRevGst(quote.gstPercent || 18)
    setRevisionNotes('')
    setIsReviseDialogOpen(true)
  }

  const handleAddLineItem = () => {
    setRevLineItems([...revLineItems, { desc: '', qty: 1, rate: 0 }])
  }
  
  const handleRemoveLineItem = (idx: number) => {
    setRevLineItems(revLineItems.filter((_, i) => i !== idx))
  }

  const handleUpdateLineItem = (idx: number, field: keyof ILineItem, value: any) => {
    const arr = [...revLineItems]
    arr[idx] = { ...arr[idx], [field]: value }
    setRevLineItems(arr)
  }

  const handleSaveRevision = async () => {
    if (!sourceQuotation) return

    try {
      // Identify Parent ID: if current quote IS a revision, use its parent, else use its own ID
      const parentId = sourceQuotation.parentQuotationId || sourceQuotation._id!
      const parentQuote = sourceQuotation.parentQuotationId 
        ? rootQuotes.find(r => r._id === sourceQuotation.parentQuotationId) 
        : sourceQuotation

      if (!parentQuote) throw new Error("Parent quotation root mapping missing.")

      const nextRevNum = getNextRevisionStats(parentQuote)
      
      const payload: Partial<IQuotation> = {
        enquiryId: sourceQuotation.enquiryId,
        parentQuotationId: parentId,
        revisionNumber: nextRevNum,
        revisionNotes: revisionNotes || `Iteration revision generated from ${sourceQuotation.quoteMeta?.ref}`,
        lineItems: revLineItems.map(item => ({ ...item, rate: Number(item.rate) })),
        welcomeTitle: revWelcome,
        terms: revTerms,
        gstPercent: revGst,
        companyDetails: sourceQuotation.companyDetails,
        clientDetails: sourceQuotation.clientDetails,
        quoteMeta: {
          date: new Date().toLocaleDateString('en-IN'),
          validFor: sourceQuotation.quoteMeta?.validFor || '30 days',
          ref: `${parentQuote.quoteMeta?.ref || 'QT'}-R${nextRevNum}`
        },
        status: 'Draft'
      }

      const res = await createQuotation(payload).unwrap()
      
      // Optional: automatically transition old quotation state to 'Revised'
      if (sourceQuotation.status !== 'Revised' && sourceQuotation.status !== 'Approved') {
        await updateQuotation({ id: sourceQuotation._id!, data: { status: 'Revised' } }).unwrap()
      }

      toast.success(`Successfully generated revision R${nextRevNum}!`)
      setIsReviseDialogOpen(false)
      if (res && res._id) {
        setSelectedQuotationId(res._id)
      }
      refetch()
      onQuotationChange?.()
    } catch (err) {
      console.error("Sync fault saving revision:", err)
      toast.error("Error generating revised iteration.")
    }
  }

  const handleUpdateStatus = async (status: 'Approved' | 'Rejected' | 'Sent') => {
    if (!selectedQuotationId) return
    try {
      await updateQuotation({ id: selectedQuotationId, data: { status } }).unwrap()
      toast.success(`Quotation marked as ${status}!`)
      refetch()
      onQuotationChange?.()
    } catch (err) {
      toast.error("Failed to sync status change.")
    }
  }

  // Simple totals calculation for draft inside Revision modal
  const modalSubtotal = revLineItems.reduce((s, i) => s + (i.qty * (Number(i.rate) || 0)), 0)
  const modalGst = modalSubtotal * (revGst / 100)
  const modalTotal = modalSubtotal + modalGst

  // 5. Helper Renders
  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-900/30 dark:text-rose-400'
      case 'Sent':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'Revised':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-900/30 dark:text-amber-400'
      default: // Draft
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-800/40 dark:text-slate-400'
    }
  }

  // Standard card render for list
  const QuotationCard = ({ item, isChild = false }: { item: IQuotation; isChild?: boolean }) => {
    const isActive = selectedQuotationId === item._id
    const childCount = !isChild ? (revisionTree[item._id!] || []).length : 0
    const isExpanded = !!expandedRootIds[item._id!]

    return (
      <div 
        onClick={() => setSelectedQuotationId(item._id!)}
        className={`group relative rounded-xl border transition-all duration-200 ease-out select-none cursor-pointer p-4 bg-white dark:bg-slate-900/40 ${
          isActive 
            ? 'border-[#c23329] shadow-sm ring-1 ring-[#c23329]/20 bg-[#c23329]/2' 
            : 'hover:border-slate-300 hover:shadow-xs dark:hover:border-slate-700 border-slate-200/70 dark:border-slate-800'
        } ${isChild ? 'ml-8' : 'ml-0'}`}
      >
        {/* Thread Line connectors for Child Revisions */}
        {isChild && (
          <>
            <div className="absolute left-[-18px] top-[-20px] bottom-1/2 w-[2px] bg-slate-200 dark:bg-slate-800 group-hover:bg-[#c23329]/40 transition-colors"></div>
            <div className="absolute left-[-18px] bottom-1/2 w-[18px] h-[2px] bg-slate-200 dark:bg-slate-800 group-hover:bg-[#c23329]/40 transition-colors"></div>
          </>
        )}

        <div className="flex flex-col gap-3">
          {/* Top Meta Line */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {!isChild && childCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => toggleExpand(item._id!, e)}
                    className="h-5 w-5 rounded-md text-slate-400 hover:bg-slate-100 p-0 dark:hover:bg-slate-800 shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronRight className="w-3.5 h-3.5"/>}
                  </Button>
                )}
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                  {isChild ? `Rev ${item.revisionNumber}` : 'Original (Main)'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                {item.quoteMeta?.ref || item.referenceNumber || 'UNSAVED-QT'}
              </h4>
            </div>
            <Badge className={`text-[10px] py-0.5 px-2 rounded-full uppercase border shadow-none shrink-0 font-bold font-mono ${getStatusStyles(item.status)}`}>
              {item.status || 'Draft'}
            </Badge>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-3 gap-2 items-center pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Date Issued</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Calendar className="w-3 h-3 opacity-60" />
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Items Count</span>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {item.lineItems?.length || 0} line items
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Total Price</span>
              <div className="text-sm font-extrabold text-[#c23329]">
                ₹{(item.totalAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Revision notes quick preview */}
          {item.revisionNotes && (
            <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg p-2 border border-slate-100/50 dark:border-slate-800 flex gap-1.5 items-start">
              <Clock className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-500 italic leading-tight truncate" title={item.revisionNotes}>
                "{item.revisionNotes}"
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Pre-condition checks
  if (!enquiryId) {
    return (
      <Card className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center max-w-md mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-slate-400 mb-3" />
        <h4 className="font-bold text-slate-800 mb-1">No Enquiry Associated</h4>
        <p className="text-sm text-slate-500">Feed an Enquiry ID pipeline context into manager props to load historic quotation assets.</p>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex flex-col gap-3 p-6 justify-center items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#c23329]" />
          <span className="text-sm font-semibold tracking-wide animate-pulse">Synchronizing quotation logs...</span>
        </div>
      ) : rawQuotations.length === 0 ? (
        <Card className="flex-1 border-2 border-dashed p-16 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/20 dark:bg-slate-900/10">
          <div className="w-16 h-16 bg-[#c23329]/10 text-[#c23329] rounded-full flex items-center justify-center mb-6">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">No Quotation Streams Registered</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
            This enquiry does not possess active proposal chains yet. Initiate the sales lifecycle by preparing the first quotation draft.
          </p>
          <Button 
            className="bg-[#c23329] hover:bg-[#a32b22] text-white rounded-2xl font-extrabold px-8 h-12 shadow-md tracking-wide uppercase flex items-center gap-2 border-none active:scale-[0.98] transition-all"
            onClick={() => {
              // Fallback handler or redirect
              toast("Initiating clean draft... Please open Quotation Builder Page.", { icon: '📝' })
            }}
          >
            <Plus className="w-5 h-5" /> Create Master Quotation
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch select-none">
          
          {/* 1. MAIN STREAM COLUMN (7 cols) */}
          <div className="xl:col-span-7 space-y-5 overflow-y-auto pr-2 max-h-[calc(100vh-240px)] scrollbar-thin pb-6">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                  <History className="w-4 h-4 text-[#c23329]" />
                  Iteration Pipelines
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">{rootQuotes.length} Main Chain(s) • {rawQuotations.length - rootQuotes.length} Iteration revisions</p>
              </div>
            </div>

            {/* Loop Master Chain */}
            <div className="space-y-6">
              {rootQuotes.map((root) => {
                const revisions = revisionTree[root._id!] || []
                const isExpanded = !!expandedRootIds[root._id!]

                return (
                  <div key={root._id} className="space-y-3">
                    {/* Master Quote Card */}
                    <QuotationCard item={root} isChild={false} />
                    
                    {/* Revisions List (if nested and expanded) */}
                    {revisions.length > 0 && isExpanded && (
                      <div className="space-y-3 border-l border-dashed border-slate-200 dark:border-slate-800/60 ml-6 pl-2 py-1 relative animate-in slide-in-from-top-2 duration-200">
                        {revisions.map((rev) => (
                          <QuotationCard key={rev._id} item={rev} isChild={true} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. RIGHT INSPECTOR PANEL (5 cols) */}
          <div className="xl:col-span-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-card rounded-2xl shadow-sm flex flex-col h-[calc(100vh-240px)] max-h-[calc(100vh-240px)] overflow-hidden sticky top-4 animate-in fade-in-50 duration-300">
            
            {activeQuotation ? (
              <div className="flex flex-col h-full">
                {/* Inspector Header */}
                <CardHeader className="bg-slate-50/40 dark:bg-slate-900/20 p-5 border-b flex flex-col gap-4 shrink-0">
                  <div className="flex justify-between items-start w-full gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-sm tracking-tight truncate text-foreground" title={activeQuotation.quoteMeta?.ref}>
                          {activeQuotation.quoteMeta?.ref || 'Quotation File'}
                        </h3>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
                        {activeQuotation.parentQuotationId ? `Revision #${activeQuotation.revisionNumber} Loop` : 'Master Generation Account'}
                      </p>
                    </div>
                    <Badge className={`text-[10px] font-mono py-0.5 px-2 rounded-full border shadow-none font-bold shrink-0 ${getStatusStyles(activeQuotation.status)}`}>
                      {activeQuotation.status || 'Draft'}
                    </Badge>
                  </div>

                  {/* Action Matrix */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    <Button 
                      onClick={() => handleOpenRevisionModal(activeQuotation)}
                      size="sm" 
                      className="bg-[#c23329] hover:bg-[#a32b22] text-white border-none font-extrabold text-xs h-8 px-3 shadow-xs flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Layers className="w-3 h-3" /> Add Revision
                    </Button>
                    
                    {activeQuotation.status === 'Draft' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus('Sent')}
                        className="border-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs h-8 shrink-0 shadow-none transition-all bg-transparent hover:bg-slate-100"
                      >
                        <Share2 className="w-3 h-3 mr-1 text-indigo-500" /> Mark Sent
                      </Button>
                    )}

                    {activeQuotation.status === 'Sent' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus('Approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-8 shrink-0 transition-all border-none shadow-none flex items-center"
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleUpdateStatus('Rejected')}
                          className="border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs h-8 shrink-0 transition-all dark:border-rose-950 dark:hover:bg-rose-950/20 shadow-none"
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>

                {/* Inspector Content Container - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6 select-text">
                  
                  {/* 1. Revision Memo Notes */}
                  {activeQuotation.revisionNotes && (
                    <div className="bg-amber-500/4 border border-amber-500/20 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
                      <div className="absolute right-2 top-2 text-amber-600/10">
                        <History className="w-16 h-16 -rotate-12" />
                      </div>
                      <h5 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1 relative z-10">
                        <Clock className="w-3 h-3" /> Revision Log Commentary
                      </h5>
                      <p className="text-xs font-semibold text-slate-700 dark:text-amber-100/80 leading-relaxed italic relative z-10">
                        "{activeQuotation.revisionNotes}"
                      </p>
                    </div>
                  )}

                  {/* 2. Pricing Layout Info Card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Subtotal Baseline</span>
                      <p className="text-sm font-extrabold mt-0.5 text-slate-700 dark:text-slate-300">₹{activeQuotation.subtotal?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-[#c23329]/2 border border-[#c23329]/10 p-3.5 rounded-xl">
                      <span className="text-[9px] text-[#c23329]/70 uppercase tracking-wider font-extrabold">Grand Settlement</span>
                      <p className="text-base font-black mt-0.5 text-[#c23329]">₹{activeQuotation.totalAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  {/* 3. Items Table Snapshot */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Delivered Items Scope ({activeQuotation.lineItems?.length || 0})</h5>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/20 shadow-2xs">
                      <Table className="text-xs">
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                          <TableRow>
                            <TableHead className="py-2 h-auto font-extrabold text-slate-500">Service Description</TableHead>
                            <TableHead className="py-2 h-auto font-extrabold text-right text-slate-500">Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeQuotation.lineItems?.map((line, idx) => (
                            <TableRow key={idx} className="border-b-slate-100/80 dark:border-b-slate-800/50 hover:bg-transparent">
                              <TableCell className="py-2 font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                {line.desc}
                                <span className="block font-medium text-[10px] text-slate-400 mt-0.5">Qty: {line.qty}</span>
                              </TableCell>
                              <TableCell className="py-2 font-extrabold text-right text-slate-700 dark:text-slate-300">
                                ₹{line.rate.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* 4. Company Sign-off info */}
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold block">Originating Handler</span>
                        <span className="text-xs font-black text-[#c23329] tracking-tight block mt-0.5">
                          {activeQuotation.companyDetails?.name || 'CRM Systems'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold block">Validity Window</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                          {activeQuotation.quoteMeta?.validFor || '30 days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Placeholder Section: Files & Audits */}
                  <div className="grid grid-cols-2 gap-3 border-t border-dashed border-slate-100 dark:border-slate-800 pt-4">
                    <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                      <History className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Audit Logs</span>
                      <span className="text-[9px] text-slate-400 font-medium">Placeholder</span>
                    </div>
                    <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Attachments</span>
                      <span className="text-[9px] text-slate-400 font-medium">Placeholder</span>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Layers className="w-10 h-10 mb-3 opacity-20" />
                <h4 className="font-extrabold text-sm text-slate-600 dark:text-slate-300 tracking-wide">Select Document Node</h4>
                <p className="text-xs max-w-[240px] mt-1 leading-relaxed text-slate-400">
                  Click any quotation or nested revision iteration card to inspect granular deliverables, calculate margins, or approve transaction stages.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* 3. ADD REVISED QUOTATION MODAL (DIALOG)                */}
      {/* ----------------------------------------------------- */}
      <Dialog open={isReviseDialogOpen} onOpenChange={setIsReviseDialogOpen}>
        <DialogContent className="sm:max-w-[680px] rounded-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-thin p-0 border-none select-none shadow-2xl">
          
          {/* Modal Header Context */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-6 py-5 rounded-t-3xl relative overflow-hidden border-b">
            <div className="absolute inset-0 bg-[#c23329]/10 mix-blend-overlay"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#e35a4f]" />
                  <span className="text-[10px] font-extrabold text-[#e35a4f] uppercase tracking-widest">Iteration Workshop</span>
                </div>
                <DialogTitle className="text-lg font-bold text-white">Generate Revised Quotation Record</DialogTitle>
              </div>
              
              {sourceQuotation && (
                <div className="text-right">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Copy From Target</span>
                  <span className="text-xs font-extrabold text-white tracking-wider">{sourceQuotation.quoteMeta?.ref}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Form Area */}
          <div className="p-6 space-y-6">
            {/* 1. Revision Log Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="revNotes" className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Revision Change Log Commentary</Label>
              <Textarea 
                id="revNotes"
                placeholder="Briefly explain why this version is being generated. E.g., Client asked for 10% discount on UI design, added API server config..."
                className="rounded-xl text-xs font-medium min-h-[60px] bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-[#c23329] transition-all"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
              />
            </div>

            <Separator className="opacity-60 border-dashed" />

            {/* 2. Grid Setup: Details Mapping */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Modify Deliverables Scope & Rates</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddLineItem}
                  className="h-7 text-[10px] px-2 font-extrabold rounded-md text-[#c23329] border border-[#c23329]/20 hover:bg-[#c23329]/5 tracking-wide uppercase"
                >
                  <Plus className="w-3 h-3 mr-1" /> Insert Element
                </Button>
              </div>

              {/* Dynamic Line Items Table Wrapper */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[240px] overflow-y-auto shadow-xs bg-white dark:bg-slate-950">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b font-bold">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase text-slate-400 py-2.5 h-auto">Service Block Description</TableHead>
                      <TableHead className="text-[10px] uppercase text-slate-400 py-2.5 h-auto text-center w-16">Qty</TableHead>
                      <TableHead className="text-[10px] uppercase text-slate-400 py-2.5 h-auto text-right w-28">Rate (₹)</TableHead>
                      <TableHead className="py-2.5 h-auto w-8 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revLineItems.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/50">
                        <TableCell className="p-2">
                          <Input 
                            className="h-8 text-xs font-semibold border-transparent bg-transparent focus-visible:ring-0 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 shadow-none"
                            placeholder="Scope details..."
                            value={item.desc}
                            onChange={(e) => handleUpdateLineItem(idx, 'desc', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          <Input 
                            type="number"
                            className="h-8 text-xs font-bold border-transparent bg-transparent focus-visible:ring-0 hover:bg-slate-50 dark:hover:bg-slate-800 px-0 text-center shadow-none"
                            value={item.qty}
                            onChange={(e) => handleUpdateLineItem(idx, 'qty', parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input 
                            type="number"
                            className="h-8 text-xs font-extrabold border-transparent bg-transparent focus-visible:ring-0 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 text-right shadow-none"
                            value={item.rate}
                            onChange={(e) => handleUpdateLineItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="h-6 w-6 text-rose-400 hover:text-rose-600 rounded-md shrink-0"
                            disabled={revLineItems.length <= 1}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 3. Setup Footer Split Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Pitch Text</Label>
                  <Input 
                    className="h-9 text-xs rounded-xl bg-slate-50/50 font-semibold"
                    value={revWelcome}
                    onChange={(e) => setRevWelcome(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Remittance / Terms</Label>
                  <Textarea 
                    className="min-h-[60px] text-xs rounded-xl bg-slate-50/50 font-semibold leading-relaxed"
                    value={revTerms}
                    onChange={(e) => setRevTerms(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-full relative">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Base Volume Subtotal</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{modalSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs items-center font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>Assigned GST</span>
                      <Input 
                        type="number" 
                        className="h-6 w-12 text-[10px] text-center font-bold bg-white dark:bg-slate-800 border shadow-none rounded-md p-0" 
                        value={revGst}
                        onChange={(e) => setRevGst(parseFloat(e.target.value) || 0)}
                      />
                      <span>%</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{modalGst.toLocaleString()}</span>
                  </div>
                </div>

                <Separator className="my-2 opacity-60" />

                <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block leading-none">Cumulative Net</span>
                    <span className="text-lg font-black text-[#c23329] mt-0.5 block tracking-tight leading-none">₹{modalTotal.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-md px-2 py-0.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid Math
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <DialogFooter className="bg-slate-50/60 border-t p-5 flex items-center justify-end gap-2 shrink-0 rounded-b-3xl">
            <Button 
              variant="ghost" 
              className="rounded-xl text-xs font-bold h-10 tracking-wide" 
              onClick={() => setIsReviseDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel iteration
            </Button>
            <Button 
              className="bg-[#c23329] hover:bg-[#a32b22] text-white rounded-xl font-black text-xs px-6 tracking-wider h-10 border-none flex items-center uppercase shadow-md active:scale-[0.97] transition-all"
              onClick={handleSaveRevision}
              disabled={isCreating || isUpdating}
            >
              {isCreating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Provisioning...</>
              ) : (
                <><Plus className="w-4 h-4 mr-1.5" /> Commit Revised Draft</>
              )}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}
