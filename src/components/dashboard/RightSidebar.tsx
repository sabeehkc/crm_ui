'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGetDashboardMetricsQuery } from '@/store/services/dashboardSlice'
import { Skeleton } from '@/components/ui/skeleton'

export function RightSidebar() {
  const { data: response, isLoading } = useGetDashboardMetricsQuery();
  const metrics = response?.data;

  const funnelData = metrics ? [
    { label: 'New Enquiries', count: metrics.funnel.new, color: 'bg-blue-500', value: metrics.totalEnquiries > 0 ? (metrics.funnel.new / metrics.totalEnquiries) * 100 : 0 },
    { label: 'Followup Scheduled', count: metrics.funnel.followup, color: 'bg-red-500', value: metrics.totalEnquiries > 0 ? (metrics.funnel.followup / metrics.totalEnquiries) * 100 : 0 },
    { label: 'Quotation Sent', count: metrics.funnel.quotationSent, color: 'bg-amber-500', value: metrics.totalEnquiries > 0 ? (metrics.funnel.quotationSent / metrics.totalEnquiries) * 100 : 0 },
    { label: 'Converted', count: metrics.funnel.converted, color: 'bg-green-500', value: metrics.totalEnquiries > 0 ? (metrics.funnel.converted / metrics.totalEnquiries) * 100 : 0 },
    { label: 'Rejected', count: metrics.funnel.rejected, color: 'bg-slate-400', value: metrics.totalEnquiries > 0 ? (metrics.funnel.rejected / metrics.totalEnquiries) * 100 : 0 },
  ] : [];

  const projects = metrics?.activeProjects || [];

  const getProjectColor = (progress: number) => {
    if (progress > 80) return 'bg-emerald-500';
    if (progress > 50) return 'bg-green-500';
    return 'bg-amber-500';
  }

  const formatDueDate = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Due ${months[date.getMonth()]} ${date.getDate()}`;
  }

  return (
    <div className="space-y-6">
      {/* Enquiry Funnel */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Enquiry Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))
          ) : (
            funnelData.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", item.color)} 
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Active Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="text-sm text-center py-6 text-muted-foreground">
              No active projects found
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.name} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[150px]">{project.name}</h4>
                    <p className="text-xs text-muted-foreground">{project.client} · {formatDueDate(project.dueDate)}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", getProjectColor(project.progress))} 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
