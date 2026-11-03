'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideIcon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntegrationCardProps {
  name: string
  description: string
  icon: React.ReactNode
  status: 'Connected' | 'Disconnected'
  onToggle: () => void
}

export function IntegrationCard({ name, description, icon, status, onToggle }: IntegrationCardProps) {
  const isConnected = status === 'Connected'

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
              {icon}
            </div>
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs",
                isConnected && "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {isConnected ? (
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>
              ) : 'Disconnected'}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            variant={isConnected ? "outline" : "default"} 
            className={cn("w-full font-medium rounded-xl")}
            onClick={onToggle}
          >
            {isConnected ? 'Configure' : 'Connect Integration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
