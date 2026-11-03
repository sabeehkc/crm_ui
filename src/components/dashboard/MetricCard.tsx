'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend: string
  trendType: 'up' | 'down'
  className?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendType,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg",
            trendType === 'up' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
          )}>
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
