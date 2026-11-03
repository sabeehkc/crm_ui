'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  Printer, 
  Plus, 
  X, 
  Save, 
  Loader2, 
  History, 
  Copy, 
  FileText, 
  ArrowUp,
  AlertCircle,
  Search,
  ChevronDown,
  Check
} from 'lucide-react'
import { useListEnquiriesQuery, useUpdateEnquiryMutation } from '@/store/services/enquirySlice'
import { 
  useCreateQuotationMutation, 
  useUpdateQuotationMutation,
  useListQuotationsQuery
} from '@/store/services/quotationSlice'
import { IQuotation, ILineItem, ITimelineItem, IFeatureItem } from '@/types/quotation'
import toast from 'react-hot-toast'
import { useGetCompanySettingsQuery } from '@/store/services/settingSlice'

export const QuotationBuilder = () => {
  const { data: enquiriesData } = useListEnquiriesQuery({ limit: 100 })
  const [updateEnquiry] = useUpdateEnquiryMutation()
  const [createQuotation, { isLoading: isSaving }] = useCreateQuotationMutation()
  const [updateQuotation, { isLoading: isUpdating }] = useUpdateQuotationMutation()

  const {data: companyData} = useGetCompanySettingsQuery()

  // Active State management
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('')
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(null)
  const [parentQuotationId, setParentQuotationId] = useState<string | null>(null)
  const [revisionNumber, setRevisionNumber] = useState<number>(1)

  // Typeahead / Combobox State
  const [enquirySearch, setEnquirySearch] = useState('')
  const [isEnquiryListOpen, setIsEnquiryListOpen] = useState(false)
  const enquiryRef = React.useRef<HTMLDivElement>(null)

  // Fetch existing quotations for selected enquiry
  const { data: existingQuotesResponse, isLoading: isLoadingQuotes } = useListQuotationsQuery(
    { enquiryId: selectedEnquiryId, limit: 50 }, 
    { skip: !selectedEnquiryId }
  )
  const existingQuotes = existingQuotesResponse?.data?.items || []

  // Print reference
  const printRef = React.useRef<HTMLDivElement>(null)

  // Draft States
  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { desc: 'UI/UX Design', qty: 1, rate: 15000 },
    { desc: 'Frontend Development', qty: 1, rate: 35000 },
    { desc: 'Backend API', qty: 1, rate: 25000 },
  ])

  const [salutation, setSalutation] = useState('Dear Sir,')
  const [welcomeTitle, setWelcomeTitle] = useState('Thank you for your valuable enquiry. We are pleased to submit our quotation for Phase 1 development of your BuildSource E-commerce Website and Web Admin Panel only, focusing on the single-seller model for building materials, as detailed in the PRD.')
  const [projectOverview, setProjectOverview] = useState('This PRD details the requirements for a multi-platform e-commerce solution for building materials. The platform will operate as a single-seller model (BuildSource) in Phase 1 but must be architecturally prepared for a Phase 2 transition to a multi-vendor marketplace.')
  const [coreObjective, setCoreObjective] = useState('To launch a unified e-commerce platform (Website) to expand the existing building materials business, ensuring scalability for a future multi-vendor marketplace.')
  const [featureItems, setFeatureItems] = useState<IFeatureItem[]>([
    { module: 'User Auth', user: 'All Users', feature: 'Login, Register, Password Reset' },
    { module: 'Product Catalog', user: 'Customer', feature: 'Browse products, Search, Filters' }
  ])
  const [thanksNote, setThanksNote] = useState('Thank you for the opportunity to propose the development of the BuildSource E-commerce Platform based on your PRD. As requested, we have prepared two distinct proposals to give you flexibility in launching your platform.')
  const [termsPoints, setTermsPoints] = useState<string[]>([
    'A 40% advance payment is required to commence the project.',
    'Remaining payments to be made in milestones tied to project phases.',
    'Hosting: The first six months of production cloud hosting will be covered.',
    'Maintenance: Maintenance charges (bug fixes) will be covered for the first six months.',
    'Third-party service fees (e.g., Google Maps API subscription, Payment gateway transaction fees.'
  ])
  const [closingNote, setClosingNote] = useState('We hope you find our offer to be in line with your requirement.')
  const [signatureName, setSignatureName] = useState('Basil Jiji')
  const [signatureRole, setSignatureRole] = useState('Chief Technical Officer')
  const [terms, setTerms] = useState('Payment due within 30 days of invoice.')
  const [timelineItems, setTimelineItems] = useState<ITimelineItem[]>([
    { title: 'Project Kickoff', description: "jii", duration: '2 week', amount: 15000 },
    { title: 'Design Approval', description: "jii", duration: '3 days', amount: 20000 },
  ])

  useEffect(() => {
    if (companyData?.data) {
      setCompanyDetails({
        name: companyData.data.companyName || 'CRM Technologies',
        address: companyData.data.address || '123 Tech Park, Bangalore',
        phone: companyData.data.mobileNo || '+91 98765 00000',
        email: companyData.data.email || 'info@crm.com'
      })
      if (companyData.data.signatureName) setSignatureName(companyData.data.signatureName)
      if (companyData.data.signatureRole) setSignatureRole(companyData.data.signatureRole)
    }
  }, [companyData])

  const [companyDetails, setCompanyDetails] = useState({
    name: 'CRM Technologies',
    address: '123 Tech Park, Bangalore',
    phone: '+91 98765 00000',
    email: 'info@crm.com'
  })

  const [clientDetails, setClientDetails] = useState({
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com'
  })

  const [quoteMeta, setQuoteMeta] = useState({
    date: '6/5/2026',
    validFor: '30 days',
    ref: 'QT-AUTO'
  })

  const [gstPercent, setGstPercent] = useState(18)

  // Calculators
  const lineItemsSubtotal = lineItems.reduce((acc, item) => acc + (item.qty * (Number(item.rate) || 0)), 0)
  const milestonesSubtotal = timelineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
  const subtotal = lineItemsSubtotal + milestonesSubtotal
  const gst = subtotal * (gstPercent / 100)
  const total = subtotal + gst

  // Handlers
  const addLineItem = () => setLineItems([...lineItems, { desc: '', qty: 1, rate: 0 }])
  const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, idx) => idx !== index))
  const updateLineItem = (index: number, field: keyof ILineItem, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  }

  const addTermsPoint = () => setTermsPoints([...termsPoints, ''])
  const removeTermsPoint = (index: number) => setTermsPoints(termsPoints.filter((_, idx) => idx !== index))
  const updateTermsPoint = (index: number, value: string) => {
    const updated = [...termsPoints]
    updated[index] = value
    setTermsPoints(updated)
  }

  const addMilestone = () => setTimelineItems([...timelineItems, { title: '',description: '', duration: '', amount: 0 }])
  const removeMilestone = (index: number) => setTimelineItems(timelineItems.filter((_, idx) => idx !== index))
  const updateMilestone = (index: number, field: keyof ITimelineItem, value: string | number) => {
    const updated = [...timelineItems];
    (updated[index] as any)[field] = value;
    setTimelineItems(updated);
  }
  
  const addFeatureItem = () => setFeatureItems([...featureItems, { module: '', user: '', feature: '' }])
  const removeFeatureItem = (index: number) => setFeatureItems(featureItems.filter((_, idx) => idx !== index))
  const updateFeatureItem = (index: number, field: keyof IFeatureItem, value: string) => {
    const updated = [...featureItems];
    (updated[index] as any)[field] = value;
    setFeatureItems(updated);
  }

  const enquiries = enquiriesData?.data?.items || []

  // Filtered enquiries for typeahead
  const filteredEnquiries = React.useMemo(() => {
    if (!enquirySearch) return enquiries
    const lowSearch = enquirySearch.toLowerCase()
    return enquiries.filter(enq => 
      enq.name.toLowerCase().includes(lowSearch) || 
      (enq.service && enq.service.toLowerCase().includes(lowSearch))
    )
  }, [enquiries, enquirySearch])

  const selectedEnquiry = React.useMemo(() => 
    enquiries.find(e => e._id === selectedEnquiryId)
  , [enquiries, selectedEnquiryId])

  // Handle outside clicks to close enquiry dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (enquiryRef.current && !enquiryRef.current.contains(event.target as Node)) {
        setIsEnquiryListOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync search input with selected enquiry name when not searching
  useEffect(() => {
    if (!isEnquiryListOpen && selectedEnquiry) {
      setEnquirySearch(selectedEnquiry.name)
    }
  }, [selectedEnquiry, isEnquiryListOpen])

  const handleEnquirySelect = (id: string) => {
    loadFromEnquiry(id)
    setIsEnquiryListOpen(false)
    const enq = enquiries.find(e => e._id === id)
    if (enq) setEnquirySearch(enq.name)
  }

  // Load and clean routine when selecting another Enquiry
  const loadFromEnquiry = (id: string) => {
    setSelectedEnquiryId(id)
    setActiveQuotationId(null)
    setParentQuotationId(null)
    setRevisionNumber(1)
    if (!id) return
    const enq = enquiriesData?.data?.items?.find(e => e._id === id)
    if (enq) {
      setClientDetails({
        name: enq.name,
        company: 'Company N/A',
        email: enq.email
      })
      setQuoteMeta({
        date: new Date().toLocaleDateString('en-IN'),
        validFor: '30 days',
        ref: `QT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      })
      // Seed line item based on enquiry service
      setLineItems([
        { desc: enq.service || 'Standard Services Package', qty: 1, rate: 0 }
      ])
      setTimelineItems([])
    }
  }

  // Core handler for loading selected historical quote
  const handleSelectQuotation = (q: IQuotation) => {
    setActiveQuotationId(q._id || null)
    setParentQuotationId(null)
    setRevisionNumber(q.revisionNumber || 1)
    setLineItems(q.lineItems || [])
    setWelcomeTitle(q.welcomeTitle || '')
    setSalutation(q.salutation || 'Dear Sir,')
    setProjectOverview(q.projectOverview || '')
    setCoreObjective(q.coreObjective || '')
    setFeatureItems(q.features || [])
    setThanksNote(q.thanksNote || '')
    setClosingNote(q.closingNote || 'We hope you find our offer to be in line with your requirement.')
    setSignatureName(q.signatureName || 'Basil Jiji')
    setSignatureRole(q.signatureRole || 'Chief Technical Officer')
    setTermsPoints(q.termsPoints || [])
    setTerms(q.terms || '')
    setTimelineItems(q.timelineItems || [])
    setCompanyDetails(q.companyDetails || { name: '', address: '', phone: '', email: '' })
    setClientDetails(q.clientDetails || { name: '', company: '', email: '' })
    setQuoteMeta(q.quoteMeta || { date: '', validFor: '', ref: '' })
    setGstPercent(q.gstPercent || 18)
  }

  // Flow: create a fresh draft for the SAME selected enquiry
  const handleNewBlankQuotation = () => {
    setActiveQuotationId(null)
    setParentQuotationId(null)
    setRevisionNumber(1)
    setLineItems([{ desc: 'Standard Service', qty: 1, rate: 0 }])
    setTimelineItems([])
    setFeatureItems([])
    setThanksNote('')
    setClosingNote('')
    setSignatureName('')
    setSignatureRole('')
    setTermsPoints([])
    setQuoteMeta({
      date: new Date().toLocaleDateString('en-IN'),
      validFor: '30 days',
      ref: `QT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    })
    toast.success('Drafting clean quotation.')
  }

  // Flow: Load current draft parameters but clear ID to save it as a separate revision instance
  const handleReviseQuotation = () => {
    if (!activeQuotationId) return
    setParentQuotationId(activeQuotationId)
    setActiveQuotationId(null) // Disconnects it from the loaded one, saving creates a fresh object
    setRevisionNumber(prev => prev + 1)
    
    const baseRef = quoteMeta.ref?.split('-REV')[0] || 'QT'
    const newRef = `${baseRef}-REV${Math.floor(1000 + Math.random() * 9000)}`
    
    setQuoteMeta(prev => ({
      ...prev,
      ref: newRef,
      date: new Date().toLocaleDateString('en-IN')
    }))
    toast.success("Active parameters duplicated! Click 'Save Quotation' to write as a new version.")
  }

  const handleSaveQuotation = async () => {
    if (!selectedEnquiryId) {
      toast.error('No enquiry linked. Please select an enquiry first.')
      return
    }

    try {
      const quotePayload: Partial<IQuotation> = {
        enquiryId: selectedEnquiryId,
        lineItems,
        welcomeTitle,
        salutation,
        projectOverview,
        coreObjective,
        features: featureItems,
        thanksNote,
        closingNote,
        signatureName,
        signatureRole,
        termsPoints,
        terms,
        timelineItems,
        companyDetails,
        clientDetails,
        quoteMeta,
        gstPercent,
        revisionNumber,
        ...(parentQuotationId ? { parentQuotationId } : {})
      }

      if (activeQuotationId) {
        await updateQuotation({ id: activeQuotationId, data: quotePayload }).unwrap()
        toast.success('Quotation changes saved!')
      } else {
        const isRevision = !!parentQuotationId;
        const res = await createQuotation(quotePayload).unwrap()
        if (res && res._id) {
          setActiveQuotationId(res._id)
          
          if (parentQuotationId) {
            await updateQuotation({ id: parentQuotationId, data: { status: 'Revised' } }).unwrap()
            setParentQuotationId(null)
          }
        }
        
        // Also update the associated enquiry
        await updateEnquiry({
          id: selectedEnquiryId,
          data: isRevision
            ? { status: 'Revised Quotation', revisedQuotationDate: new Date() }
            : { status: 'Quotation Sent', quotationSentDate: new Date() }
        }).unwrap()
        
        toast.success('New quotation iteration created successfully!')
      }
    } catch (err) {
      console.error('Failed to save:', err)
      toast.error('Sync fault encountered during save.')
    }
  }

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow pop-ups to print.')
      return
    }

    // Clone DOM to properly map input dynamic user-written values into standard attributes before innerHTML captures it
    const domClone = printRef.current.cloneNode(true) as HTMLElement
    const inputs = printRef.current.querySelectorAll('input')
    const textareas = printRef.current.querySelectorAll('textarea')
    const clonedInputs = domClone.querySelectorAll('input')
    const clonedTextareas = domClone.querySelectorAll('textarea')

    inputs.forEach((el, index) => {
      if (clonedInputs[index]) clonedInputs[index].setAttribute('value', el.value)
    })
    textareas.forEach((el, index) => {
      if (clonedTextareas[index]) clonedTextareas[index].innerHTML = el.value
    })

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((s) => s.outerHTML)
      .join('\n')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation - ${quoteMeta.ref || 'Print'}</title>
          ${styles}
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
              padding: 40px !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            /* Hide interactive elements & inputs clean-up */
            .no-print, button, .lucide {
              display: none !important;
            }
            input, textarea {
              border: none !important;
              outline: none !important;
              padding: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              resize: none;
              pointer-events: none;
            }
            .table-border-fix {
              border-collapse: collapse !important;
            }
          </style>
        </head>
        <body>
          <div class="w-full">
            ${domClone.innerHTML}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const isActionProcessing = isSaving || isUpdating

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Elite Hub Selector Top Section */}
      <Card className="shadow-sm border-none rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-stone-900 text-white relative z-50 overflow-visible">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#c23329]/20 rounded-lg text-[#e35a4f]">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Quotation Management Desk</h2>
            </div>
            <p className="text-slate-300 text-xs">Assign transactions, maintain iteration logs, and issue client quotations seamlessly.</p>
          </div>
          
          <div className="w-full md:w-96 space-y-1.5 z-50 relative" ref={enquiryRef}>
            <label className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Selected Active Enquiry</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <Input 
                placeholder="Search enquiry pipeline..."
                className="pl-10 pr-10 h-11 bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:ring-[#c23329] focus:border-[#c23329] transition-all"
                value={enquirySearch}
                onChange={(e) => {
                  setEnquirySearch(e.target.value)
                  if (!isEnquiryListOpen) setIsEnquiryListOpen(true)
                }}
                onFocus={() => setIsEnquiryListOpen(true)}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isEnquiryListOpen ? 'rotate-180' : ''}`} />
              </div>

              {isEnquiryListOpen && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl border-slate-700 bg-slate-900 overflow-hidden max-h-[320px] flex flex-col">
                  <div className="overflow-y-auto custom-scrollbar">
                    {filteredEnquiries.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        No matching enquiries found
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredEnquiries.map(enq => (
                          <div 
                            key={enq._id}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              selectedEnquiryId === enq._id 
                                ? 'bg-[#c23329]/10 text-white' 
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                            onClick={() => handleEnquirySelect(enq._id)}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{enq.name}</span>
                              <span className="text-[10px] text-slate-500">{enq.service || 'No service specified'}</span>
                            </div>
                            {selectedEnquiryId === enq._id && (
                              <Check className="w-4 h-4 text-[#c23329]" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Flow Logic: Active vs. Empty Selection */}
      {!selectedEnquiryId ? (
        <Card className="p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#c23329]/10 flex items-center justify-center mb-6">
            <FileText className="w-7 h-7 text-[#c23329]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Awaiting Enquiry Association</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
            Please select an ongoing client enquiry from the top portal to load its records, view revision streams, or compile a new proposal sheet.
          </p>
          <div className="animate-bounce flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full">
            <ArrowUp className="h-5 w-5 text-[#c23329]" />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-in fade-in-50 duration-300">
          
          {/* Left Column (3cols): Version/History List */}
          <div className="xl:col-span-3 space-y-4 self-start sticky top-6">
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-2xl overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-3 pt-5 px-5 border-b flex flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#c23329]" />
                  <CardTitle className="text-sm font-extrabold">Revisions Hub</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleNewBlankQuotation} 
                  className="h-7 text-[10px] px-2 rounded-md border-[#c23329]/30 text-[#c23329] hover:bg-[#c23329]/5 hover:text-[#c23329] tracking-wide uppercase font-bold transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" /> New Draft
                </Button>
              </CardHeader>
              
              <CardContent className="p-3 space-y-2 max-h-[580px] overflow-y-auto scrollbar-thin">
                {isLoadingQuotes ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#c23329]" />
                    Fetching iterations...
                  </div>
                ) : existingQuotes.length === 0 ? (
                  <div className="py-10 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5 opacity-40" />
                    <p className="text-[11px] font-medium leading-snug">No saved records yet.<br/>Start by drafting the initial offer.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2 tracking-wider mb-1">Quotation Stream</p>
                    {existingQuotes.map((q: any) => {
                      const isActive = activeQuotationId === q._id;
                      return (
                        <div
                          key={q._id}
                          onClick={() => handleSelectQuotation(q)}
                          className={`p-3.5 rounded-xl cursor-pointer border text-left transition-all relative group flex flex-col gap-1.5 ${
                            isActive 
                              ? 'bg-[#c23329]/5 border-[#c23329]/30 ring-1 ring-[#c23329]/10 shadow-sm' 
                              : 'border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-extrabold text-xs tracking-wide truncate ${isActive ? 'text-[#c23329]' : 'text-foreground'}`}>
                              {q.quoteMeta?.ref || 'REF-N/A'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0 mt-0.5">
                              {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                            {q.welcomeTitle || 'Standard Quotation'}
                          </p>
                          
                          <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-100 dark:border-slate-800 mt-1">
                            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Total Payout</span>
                            <span className={`text-xs font-extrabold ${isActive ? 'text-[#c23329]' : 'text-slate-700 dark:text-slate-300'}`}>
                              ₹{(q.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center & Right Column (9cols): Preview & Configurations */}
          <div className="xl:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Preview Box (8 cols on desktop) */}
            <div className="lg:col-span-8">
              <Card className="shadow-sm border-none rounded-2xl bg-white dark:bg-card">
                <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b gap-4 pb-4 pt-4 px-6 bg-slate-50/30 rounded-t-2xl dark:bg-slate-900/20">
                   <div className="flex items-center gap-2 flex-1">
                     <CardTitle className="text-base font-bold flex items-center gap-1.5">
                       Quotation Layout
                       {!activeQuotationId && (
                         <span className="text-[10px] py-0.5 px-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 tracking-wider font-bold uppercase">Unsaved Draft</span>
                       )}
                     </CardTitle>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-2">
                     {/* Revise / Duplicate option if previously saved */}
                     {activeQuotationId && (
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-8 rounded-lg border-indigo-200 hover:border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-950/30 text-xs font-semibold" 
                         onClick={handleReviseQuotation}
                         title="Copy current fields into a fresh revision record."
                       >
                         <Copy className="mr-1.5 h-3.5 w-3.5" /> Revise
                       </Button>
                     )}
                     
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="h-8 rounded-lg border-[#c23329]/30 hover:border-[#c23329]/60 text-[#c23329] dark:border-red-950 text-xs font-bold bg-transparent hover:bg-[#c23329]/5 shadow-none" 
                       onClick={handleSaveQuotation} 
                       disabled={isActionProcessing}
                     >
                       {isActionProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                       {activeQuotationId ? 'Update Current' : 'Save Draft'}
                     </Button>
                     
                     <Button 
                       className="bg-[#b33131] hover:bg-[#922828] text-white h-8 rounded-lg shadow-xs text-xs font-bold px-3.5 border-none flex" 
                       size="sm"
                       onClick={handlePrint}
                     >
                       <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                     </Button>
                   </div>
                </CardHeader>

                <CardContent ref={printRef} className="p-6 sm:p-10 rounded-b-2xl select-none printable-frame">
                  {/* Company Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-8 sm:gap-0">
                    <div>
                      <h2 className="text-2xl font-bold text-[#c23329] mb-3 tracking-tight">{companyDetails.name}</h2>
                      <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {companyDetails.address}<br/>
                        {companyDetails.phone}<br/>
                        {companyDetails.email}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-foreground">QUOTATION</h1>
                      <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        <span className="font-medium text-slate-400">Date:</span> {quoteMeta.date}<br/>
                        <span className="font-medium text-slate-400">Expires:</span> {quoteMeta.validFor}<br/>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">Ref: {quoteMeta.ref}</span>
                      </div>
                    </div>
                  </div>

                  {/* Intro message */}
                  <div className="mb-10 text-slate-800 dark:text-slate-200">
                    <div className="mb-6">
                      <p className="font-bold text-base mb-4">{salutation}</p>
                      <p className="text-sm leading-relaxed mb-6">{welcomeTitle}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-base mb-2">Project Overview</h3>
                      <p className="text-sm leading-relaxed">{projectOverview}</p>
                    </div>

                    <div className="mt-8">
                      <p className="text-sm leading-relaxed">
                        <span className="font-bold">Core Objective:</span> {coreObjective}
                      </p>
                    </div>
                  </div>

                  {/* Bill To Info */}
                  <div className="mb-10 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Recipient (Bill To)</h3>
                    <div className="text-sm leading-relaxed font-bold text-foreground">
                      {clientDetails.name}<br/>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{clientDetails.company}</span><br/>
                      <span className="text-[#c23329] dark:text-red-400/80 font-semibold text-xs mt-1 block">{clientDetails.email}</span>
                    </div>
                  </div>

                  {/* Key Modules & Features Section */}
                  <div className="mb-10">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Key Modules & Feature Details</h3>
                    <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                      <Table className="table-border-fix">
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/30">
                          <TableRow className="border-b-slate-200/80 dark:border-b-slate-800">
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase w-1/4">Module</TableHead>
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase w-1/4">User</TableHead>
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase">Feature</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {featureItems.map((item, index) => (
                            <TableRow key={index} className="border-b border-slate-100 dark:border-b-slate-800/50 group">
                              <TableCell className="px-3 py-1.5">
                                 <Input 
                                   value={item.module} 
                                   onChange={(e) => updateFeatureItem(index, 'module', e.target.value)} 
                                   className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-bold placeholder:text-slate-400 px-1" 
                                   placeholder="e.g., Admin Dashboard" 
                                 />
                              </TableCell>
                              <TableCell className="px-3 py-1.5">
                                 <Input 
                                   value={item.user} 
                                   onChange={(e) => updateFeatureItem(index, 'user', e.target.value)} 
                                   className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-medium placeholder:text-slate-400 px-1" 
                                   placeholder="e.g., Administrator" 
                                 />
                              </TableCell>
                              <TableCell className="px-3 py-1.5">
                                <div className="flex items-center gap-2">
                                  <Input 
                                    value={item.feature} 
                                    onChange={(e) => updateFeatureItem(index, 'feature', e.target.value)} 
                                    className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-medium placeholder:text-slate-400 px-1 flex-1" 
                                    placeholder="Describe features..." 
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeFeatureItem(index)} 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 no-print shrink-0"
                                  >
                                     <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="p-2 px-4 bg-slate-50/30 border-t border-slate-100 dark:border-t-slate-800/50 dark:bg-slate-900/10 no-print">
                         <Button 
                           onClick={addFeatureItem} 
                           variant="ghost" 
                           size="sm" 
                           className="text-slate-400 hover:text-[#c23329] text-[10px] h-7 px-2 hover:bg-transparent tracking-wide uppercase font-bold flex items-center"
                         >
                           <Plus className="mr-1 h-3.5 w-3.5" /> Add Module Row
                         </Button>
                      </div>
                    </div>
                  </div>

                  {/* 1. Milestones Schedule Section */}
                  <div className="mb-10">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Project Schedule & Milestones</h3>
                    <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                      <Table className="table-border-fix">
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/30">
                          <TableRow className="border-b-slate-200/80 dark:border-b-slate-800">
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase">Milestone Label</TableHead>
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase">Desciption</TableHead>
                            <TableHead className="font-bold py-3 px-4 text-xs text-slate-500 uppercase">Timeframe</TableHead>
                            <TableHead className="font-bold py-3 px-4 text-right text-xs text-slate-500 uppercase">Allotted (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timelineItems.map((item, index) => (
                            <TableRow key={index} className="border-b border-slate-100 dark:border-b-slate-800/50 group">
                              <TableCell className="px-3 py-1.5">
                                 <Input 
                                   value={item.title} 
                                   onChange={(e) => updateMilestone(index, 'title', e.target.value)} 
                                   className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-medium placeholder:text-slate-400 px-1" 
                                   placeholder="e.g., System Setup & Architecture" 
                                 />
                              </TableCell>
                              <TableCell className="px-3 py-1.5">
                                 <Input 
                                   value={item.description} 
                                   onChange={(e) => updateMilestone(index, 'description', e.target.value)} 
                                   className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-medium placeholder:text-slate-400 px-1" 
                                   placeholder="e.g., System Setup & Architecture" 
                                 />
                              </TableCell>
                              <TableCell className="px-3 py-1.5">
                                 <Input 
                                   value={item.duration} 
                                   onChange={(e) => updateMilestone(index, 'duration', e.target.value)} 
                                   className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none w-28 font-semibold placeholder:text-slate-400 px-1" 
                                   placeholder="Duration" 
                                 />
                              </TableCell>
                              <TableCell className="text-right px-3 py-1.5 flex items-center justify-end gap-1">
                                <span className="text-slate-400 text-xs font-bold">₹</span>
                                <Input 
                                  type="number" 
                                  value={item.amount} 
                                  onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))} 
                                  className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none text-right w-20 font-bold px-1" 
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeMilestone(index)} 
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 no-print shrink-0"
                                >
                                   <X className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="p-2 px-4 bg-slate-50/30 border-t border-slate-100 dark:border-t-slate-800/50 dark:bg-slate-900/10 no-print">
                         <Button 
                           onClick={addMilestone} 
                           variant="ghost" 
                           size="sm" 
                           className="text-slate-400 hover:text-[#c23329] text-[10px] h-7 px-2 hover:bg-transparent tracking-wide uppercase font-bold flex items-center"
                         >
                           <Plus className="mr-1 h-3.5 w-3.5" /> Insert Milestone
                         </Button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Service Line Items Section */}
                  <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden mb-10 shadow-xs">
                    <Table className="table-border-fix">
                      <TableHeader className="bg-[#c82525]">
                        <TableRow className="border-none hover:bg-[#c82525]">
                          <TableHead className="text-white font-extrabold py-3 px-4 text-xs uppercase tracking-wider">Item Description</TableHead>
                          <TableHead className="text-white font-extrabold text-center py-3 px-4 text-xs uppercase tracking-wider w-16">Qty</TableHead>
                          <TableHead className="text-white font-extrabold text-right py-3 px-4 text-xs uppercase tracking-wider w-28">Rate (₹)</TableHead>
                          <TableHead className="text-white font-extrabold text-right py-3 px-5 text-xs uppercase tracking-wider w-32">Amount (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index} className="border-b border-slate-100 dark:border-b-slate-800/50 group">
                            <TableCell className="px-3 py-2">
                               <Input 
                                 value={item.desc} 
                                 onChange={(e) => updateLineItem(index, 'desc', e.target.value)} 
                                 className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 px-1" 
                                 placeholder="Identify specific line deliverables" 
                               />
                            </TableCell>
                            <TableCell className="px-2 py-2 text-center">
                               <Input 
                                 type="number" 
                                 value={item.qty} 
                                 onChange={(e) => updateLineItem(index, 'qty', Number(e.target.value))} 
                                 className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none w-10 mx-auto text-center font-extrabold px-0" 
                               />
                            </TableCell>
                            <TableCell className="px-2 py-2 text-right flex items-center justify-end gap-1">
                               <span className="text-slate-400 text-xs">₹</span>
                               <Input 
                                 type="number" 
                                 value={item.rate} 
                                 onChange={(e) => updateLineItem(index, 'rate', Number(e.target.value))} 
                                 className="h-9 text-xs border-transparent focus-visible:ring-0 bg-transparent shadow-none w-20 text-right font-bold px-0" 
                               />
                            </TableCell>
                            <TableCell className="text-right px-4 py-2">
                              <div className="flex items-center justify-end space-x-2">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">₹{(item.qty * item.rate).toLocaleString()}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeLineItem(index)} 
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 no-print shrink-0"
                                >
                                   <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="p-2 px-4 bg-slate-50/30 border-t border-slate-100 dark:border-t-slate-800/50 dark:bg-slate-900/10 no-print">
                       <Button 
                         onClick={addLineItem} 
                         variant="ghost" 
                         size="sm" 
                         className="text-slate-400 hover:text-[#c23329] text-[10px] h-7 px-2 hover:bg-transparent tracking-wide uppercase font-bold flex items-center"
                       >
                         <Plus className="mr-1 h-3.5 w-3.5" /> Insert Line Row
                       </Button>
                    </div>
                  </div>

                     {/* Calculated Totals */}
                  <div className="flex justify-end mb-12">
                    <div className="w-full sm:w-[280px] space-y-3 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Base Total</span>
                        <span className="text-slate-700 dark:text-slate-300">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">GST ({gstPercent}%)</span>
                        <span className="text-slate-700 dark:text-slate-300">₹{gst.toLocaleString()}</span>
                      </div>
                      <Separator className="my-1 opacity-60" />
                      <div className="flex justify-between font-black text-sm pt-1">
                        <span className="text-slate-800 dark:text-slate-100 uppercase tracking-widest">Final Payable</span>
                        <span className="text-[#b33131] text-base">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thanks Note */}
                  <div className="mb-12 text-slate-800 dark:text-slate-200">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{thanksNote}</p>
                  </div>

               

                  {/* Payment & Post-Live Terms */}
                  <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Payment & Post-Live Terms</h3>
                    <ul className="space-y-3">
                      {termsPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c23329] mt-1.5 shrink-0" />
                          <div className="flex-1 flex items-center gap-2">
                            <textarea 
                              value={point} 
                              onChange={(e) => updateTermsPoint(index, e.target.value)} 
                              className="w-full text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[20px]"
                              rows={1}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeTermsPoint(index)} 
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 no-print shrink-0"
                            >
                               <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={addTermsPoint} 
                      variant="ghost" 
                      size="sm" 
                      className="mt-4 text-slate-400 hover:text-[#c23329] text-[10px] h-7 px-2 hover:bg-transparent tracking-wide uppercase font-bold flex items-center no-print"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add Term Point
                    </Button>
                  </div>

                  {/* Signature Section */}
                  <div className="mt-16 text-slate-800 dark:text-slate-200">
                    <p className="text-sm font-medium mb-10">{closingNote}</p>
                    
                    <div className="flex flex-col items-end text-right">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">From,</p>
                        <p className="text-sm font-extrabold">{signatureName},</p>
                        <p className="text-xs font-medium text-slate-500">{signatureRole},</p>
                        <p className="text-xs font-medium text-slate-500">{companyDetails.name}</p>
                        <p className="text-xs font-medium text-slate-500">Ph : {companyDetails.phone}</p>
                        <p className="text-xs font-medium text-[#c23329]">{companyDetails.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurations Column (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-6 self-start sticky top-6">
               <Card className="shadow-xs border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-card">
                  <CardHeader className="pb-3 pt-5 px-5 border-b">
                    <CardTitle className="text-xs font-extrabold tracking-wider uppercase text-slate-400">1. Core Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 py-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Issued Date</label>
                       <Input value={quoteMeta.date} onChange={(e) => setQuoteMeta({...quoteMeta, date: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Time Valid For</label>
                       <Input value={quoteMeta.validFor} onChange={(e) => setQuoteMeta({...quoteMeta, validFor: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Transaction Ref</label>
                       <Input value={quoteMeta.ref} onChange={(e) => setQuoteMeta({...quoteMeta, ref: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-extrabold text-[#c23329]" />
                     </div>
                  </CardContent>
               </Card>

               <Card className="shadow-xs border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-card">
                  <CardHeader className="pb-3 pt-5 px-5 border-b">
                    <CardTitle className="text-xs font-extrabold tracking-wider uppercase text-slate-400">2. Client Particulars</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 py-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Client Point-of-Contact</label>
                       <Input value={clientDetails.name} onChange={(e) => setClientDetails({...clientDetails, name: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Legal Business Entity</label>
                       <Input value={clientDetails.company} onChange={(e) => setClientDetails({...clientDetails, company: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Target Email Box</label>
                       <Input value={clientDetails.email} onChange={(e) => setClientDetails({...clientDetails, email: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-semibold text-[#c23329]" />
                     </div>
                  </CardContent>
               </Card>

               <Card className="shadow-xs border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-card">
                  <CardHeader className="pb-3 pt-5 px-5 border-b">
                    <CardTitle className="text-xs font-extrabold tracking-wider uppercase text-slate-400">3. Billing/Meta Defaults</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 py-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Salutation (e.g. Dear Sir,)</label>
                       <Input 
                         value={salutation} 
                         onChange={(e) => setSalutation(e.target.value)} 
                         className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-bold" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Welcome / Salutation Block</label>
                       <textarea 
                         value={welcomeTitle} 
                         onChange={(e) => setWelcomeTitle(e.target.value)} 
                         className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Project Overview Block</label>
                       <textarea 
                         value={projectOverview} 
                         onChange={(e) => setProjectOverview(e.target.value)} 
                         className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Core Objective Statement</label>
                       <textarea 
                         value={coreObjective} 
                         onChange={(e) => setCoreObjective(e.target.value)} 
                         className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Closing Thanks Note</label>
                       <textarea 
                         value={thanksNote} 
                         onChange={(e) => setThanksNote(e.target.value)} 
                         className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Final Closing Note</label>
                       <textarea 
                         value={closingNote} 
                         onChange={(e) => setClosingNote(e.target.value)} 
                         className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Terms Clause Block</label>
                       <textarea 
                         value={terms} 
                         onChange={(e) => setTerms(e.target.value)} 
                         className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-800 px-3 py-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-[#c23329] transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Assigned GST Percentage (%)</label>
                       <Input type="number" value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-bold" />
                     </div>
                  </CardContent>
               </Card>

               <Card className="shadow-xs border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-card">
                  <CardHeader className="pb-3 pt-5 px-5 border-b">
                    <CardTitle className="text-xs font-extrabold tracking-wider uppercase text-slate-400">4. Corporate Signature</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-5 py-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Business Trading Name</label>
                       <Input value={companyDetails.name} onChange={(e) => setCompanyDetails({...companyDetails, name: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Signatory Name</label>
                       <Input value={signatureName} onChange={(e) => setSignatureName(e.target.value)} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-bold" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Signatory Role/Title</label>
                       <Input value={signatureRole} onChange={(e) => setSignatureRole(e.target.value)} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Premises Physical Address</label>
                       <Input value={companyDetails.address} onChange={(e) => setCompanyDetails({...companyDetails, address: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Direct Corporate Helpline</label>
                       <Input value={companyDetails.phone} onChange={(e) => setCompanyDetails({...companyDetails, phone: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Official Support Inbox</label>
                       <Input value={companyDetails.email} onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})} className="h-9 text-xs rounded-lg bg-slate-50/60 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 font-medium" />
                     </div>
                  </CardContent>
               </Card>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
