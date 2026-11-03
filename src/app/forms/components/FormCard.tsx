'use client'

import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Link as LinkIcon, Mail, Copy, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { IFormEndpoint } from '@/types/form'

interface FormCardProps {
  form: IFormEndpoint
  onCopyKey: (key: string) => void
}

export function FormCard({ form, onCopyKey }: FormCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{form.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>{form.domain}</span>
            </div>
          </div>
          <Badge variant={form.status === 'Active' ? "default" : "secondary"} className={form.status === 'Active' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
            {form.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 my-4 border-y border-border/50">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Submissions</span>
            <div className="font-semibold text-lg flex items-baseline gap-1">
              {form.totalSubmissions}
              <span className="text-xs font-normal text-emerald-500">+{form.spamBlocked} blocked</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Created</span>
            <div className="text-sm font-medium flex items-center gap-1.5 text-foreground pt-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(form.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{form.notificationEmails.join(', ')}</span>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 px-6 py-3 flex justify-between items-center border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground rounded-lg text-xs"
          onClick={() => onCopyKey(form.accessKey)}
        >
          <Copy className="h-3 w-3" /> Key
        </Button>
        <div className="flex gap-2">
           <Link href={`/forms/${form._id}`}>
             <Button size="sm" className="h-8 gap-1.5 rounded-lg px-3 shadow-sm bg-primary">
               Manage <Settings className="h-3 w-3 ml-0.5" />
             </Button>
           </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
