'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GuidedSupportChat } from './components/GuidedSupportChat'
import { ChatSection } from '../admin-crm/components/ChatSection'

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4 pb-10 max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">Guided Support Chatbot Interface</p>
          </div>
        </div>
        
        <div className="mt-4">
           {/* <ChatSection /> */}
          <GuidedSupportChat />
        </div>
      </div>
    </DashboardLayout>
  )
}
