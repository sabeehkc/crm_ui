'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Bell, Plus } from 'lucide-react'
import { EnquiriesTable } from './components/EnquiriesTable'
import { QuotationBuilder } from './components/QuotationBuilder'
import { EnquiryFormModal } from './components/EnquiryFormModal'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AdminCRMContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'enquiries'

  const handleTabChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('tab', val)
    router.push(`?${newParams.toString()}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-10 max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Enquiry Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage enquiries, communications and quotations</p>
          </div>
          <div className="flex space-x-3">
            {/* <Button variant="outline" className=" rounded-full px-5 shadow-sm">
               <Bell className="mr-2 h-4 w-4" /> Push Notification
            </Button> */}
            <EnquiryFormModal type={activeTab === 'sales' ? 'Sales' : 'Normal'}>
              <Button className="bg-[#c24141] hover:bg-[#a63535] text-white rounded-full px-5 shadow-sm">
                 <Plus className="mr-2 h-4 w-4" /> New Enquiry
              </Button>
            </EnquiryFormModal>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-transparent h-auto p-0 space-x-2 mb-4">
            <TabsTrigger value="enquiries" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-full px-6 py-2.5 border border-transparent data-[state=active]:border-border text-sm font-medium transition-all text-muted-foreground data-[state=active]:text-foreground">Enquiries</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-full px-6 py-2.5 border border-transparent data-[state=active]:border-border text-sm font-medium transition-all text-muted-foreground data-[state=active]:text-foreground">Sales</TabsTrigger>
            <TabsTrigger value="quotation" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-full px-6 py-2.5 border border-transparent data-[state=active]:border-border text-sm font-medium transition-all text-muted-foreground data-[state=active]:text-foreground">Quotation Builder</TabsTrigger>
          </TabsList>
          
          <div className="mt-2">
            <TabsContent value="enquiries" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <EnquiriesTable title="All Enquiries" type='Normal' />
            </TabsContent>
            <TabsContent value="sales" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <EnquiriesTable title="Sales Pipeline" type='Sales' />
            </TabsContent>
            <TabsContent value="quotation" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <QuotationBuilder />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function AdminCRMPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminCRMContent />
    </Suspense>
  )
}
