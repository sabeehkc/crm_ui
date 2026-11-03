'use client'

import React, { useState, useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  CalendarDays,
  Mail,
  User,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { IFormSubmission } from '@/types/form'
import { useDeleteSubmissionMutation } from '@/store/services/formSlice'
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { BASE_URL, FORM_URL } from '@/store/constants'
import { Loader2 } from 'lucide-react'

interface SubmissionTableProps {
  formId: string;
  submissions: IFormSubmission[];
  isLoading?: boolean;
  onRefresh?: () => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const renderSubmissionValue = (val: any): React.ReactNode => {
  if (val === undefined || val === null || val === '') return '-';
  
  if (Array.isArray(val)) {
    return (
      <ul className="list-disc pl-4 space-y-1">
        {val.map((item, i) => (
          <li key={i}>{renderSubmissionValue(item)}</li>
        ))}
      </ul>
    );
  }
  
  if (typeof val === 'object') {
    if (val.url || val.path) {
       const url = val.url || val.path;
       const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
       const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(fullUrl.split('?')[0]);
       if (isImg) {
         return (
           <a href={fullUrl} target="_blank" rel="noreferrer" className="block mt-2">
             <img src={fullUrl} alt="upload" className="max-h-48 rounded-md border object-contain bg-white dark:bg-muted/50" />
           </a>
         );
       }
       return (
         <a href={fullUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1.5 mt-1">
           <ExternalLink className="h-4 w-4" />
           {val.name || val.filename || 'View File'}
         </a>
       );
    }
    return (
      <pre className="text-xs overflow-x-auto p-2 bg-background/50 rounded-md border mt-1">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }
  
  if (typeof val === 'string') {
    const isFileUrl = val.startsWith('http') || val.startsWith('/uploads/');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(val.split('?')[0]);
    if (isFileUrl) {
      const fullUrl = val.startsWith('http') ? val : `${BASE_URL}${val}`;
      if (isImage) {
         return (
           <a href={fullUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
             <img src={fullUrl} alt="upload" className="max-h-48 rounded-md border object-contain bg-white dark:bg-muted/50" />
           </a>
         );
      }
      return (
         <a href={fullUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1.5 mt-1 break-all">
           <ExternalLink className="h-4 w-4 shrink-0" />
           <span className="truncate">{val.split('/').pop() || 'View Link'}</span>
         </a>
      );
    }
  }

  return <span className="wrap-break-word whitespace-pre-wrap">{String(val)}</span>;
}

export function SubmissionTable({ 
  formId, 
  submissions = [], 
  isLoading, 
  onRefresh,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange
}: SubmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSub, setSelectedSub] = useState<IFormSubmission | null>(null)
  const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation()
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subToDelete, setSubToDelete] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Dynamically detect all available keys from submission data payloads
  const dynamicKeys = useMemo(() => {
    const keys = new Set<string>()
    // Add priority standard keys if present generally
    // keys.add('name')
    // keys.add('email')
    
    submissions.forEach(sub => {
      if (sub.data) {
        Object.keys(sub.data).forEach(k => {
          if (typeof sub.data[k] !== 'object') {
             keys.add(k)
          }
        })
      }
    })
    
    // Keep top 5 useful columns for table presentation to avoid overcrowding
    return Array.from(keys).slice(0, 5)
  }, [submissions])

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const lowerSearch = searchTerm.toLowerCase()
      if (!searchTerm) return true
      
      // Search in main properties
      if ((sub.name?.toLowerCase() || '').includes(lowerSearch)) return true
      if ((sub.email?.toLowerCase() || '').includes(lowerSearch)) return true
      if ((sub.message?.toLowerCase() || '').includes(lowerSearch)) return true
      
      // Search extensively within the dynamic 'data' fields
      if (sub.data) {
        return Object.values(sub.data).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      }
      return false
    })
  }, [submissions, searchTerm])

  const triggerDelete = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSubToDelete(subId)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteSubmission = async () => {
    if (!subToDelete) return
    try {
      await deleteSubmission({ id: formId, subId: subToDelete }).unwrap()
      toast.success("Submission deleted permanently.")
      setIsDeleteModalOpen(false)
      setSubToDelete(null)
    } catch (err) { 
      console.error(err)
      toast.error("Failed to remove submission.")
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${BASE_URL}${FORM_URL}/${formId}/submissions/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `submissions-${formId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("CSV exported successfully.")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export CSV.")
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Read':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-transparent">Read</Badge>
      case 'Unread':
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">New</Badge>
      case 'Spam':
        return <Badge variant="destructive" className="opacity-80">Spam</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search submissions..." 
            className="pl-9 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-xl h-11 w-11 shrink-0"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh submissions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl h-11 gap-2" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button variant="outline" className="rounded-xl h-11 px-3">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white dark:bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {dynamicKeys.map(key => (
                 <TableHead key={key} className="font-medium capitalize">{key.replace(/_/g, ' ')}</TableHead>
              ))}
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} className="text-center py-12">Loading...</TableCell></TableRow>
            ) : filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((sub) => (
                <TableRow 
                  key={sub._id} 
                  className="group cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedSub(sub)}
                >
                  {dynamicKeys.map((key, i) => {
                     const val = sub.data ? sub.data[key] : (sub as any)[key]
                     return (
                       <TableCell key={key} className={`max-w-[200px] truncate ${i === 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                         {val !== undefined && val !== null ? String(val) : '-'}
                       </TableCell>
                     )
                  })}
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                        onClick={(e) => triggerDelete(sub._id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{Math.min((page - 1) * limit + 1, total)}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span> results
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
            <select 
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 w-16 bg-transparent border rounded-md text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              {[10, 20, 50, 100].map(v => (
                <option key={v} value={v} className="bg-background">{v}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium">
              Page {page} of {Math.ceil(total / limit) || 1}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= Math.ceil(total / limit) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl overflow-hidden">
          {selectedSub && (
            <div className="flex flex-col h-full">
              <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/20">
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <DialogTitle className="text-xl font-bold">Submission Details</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(selectedSub.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedSub.status)}
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedSub.data || { name: selectedSub.name, email: selectedSub.email, message: selectedSub.message }).map(([key, value]) => {
                    if (key === 'access_key' || value === undefined || value === null || value === '') return null;
                    const isLongText = (typeof value === 'string' && value.length > 60) || typeof value === 'object' || Array.isArray(value);
                    
                    return (
                      <div key={key} className={`space-y-1.5 ${isLongText ? 'sm:col-span-2' : ''}`}>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 capitalize">
                          <Database className="h-3 w-3" /> {key.replace(/_/g, ' ')}
                        </label>
                        <div className={`font-medium text-foreground p-3 bg-muted/30 rounded-lg border ${isLongText ? 'leading-relaxed' : 'truncate'}`}>
                          {renderSubmissionValue(value)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                   <Button variant="outline" className="rounded-xl" onClick={() => setSelectedSub(null)}>
                     Close
                   </Button>
                   <Button className="rounded-xl bg-primary text-primary-foreground">
                     Reply via Email
                   </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSubmission}
        isLoading={isDeleting}
        title="Erase Submission Record"
        description="Proceeding permanently removes this data row. Action reflects universally on your submission logs. Continue?"
      />
    </div>
  )
}
