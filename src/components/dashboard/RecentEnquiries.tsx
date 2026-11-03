'use client'

import React from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGetRecentEnquiriesQuery } from '@/store/services/dashboardSlice'
import { Skeleton } from '@/components/ui/skeleton'

const statusStyles: Record<string, string> = {
  'New': 'bg-blue-500/10 text-blue-600',
  'Followup': 'bg-amber-500/10 text-amber-600',
  'Quotation Sent': 'bg-orange-500/10 text-orange-600',
  'Converted': 'bg-green-500/10 text-green-600',
  'Rejected': 'bg-red-500/10 text-red-600',
}

export function RecentEnquiries() {
  const { data: response, isLoading } = useGetRecentEnquiriesQuery();
  const enquiries = response?.data || [];

  const formatRelativeTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">Recent Enquiries</CardTitle>
          <p className="text-sm text-muted-foreground">Latest inbound leads</p>
        </div>
        <Link href="/admin-crm" className="text-xs text-primary hover:underline font-medium">View All →</Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Email</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Service</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Time</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-none">
                  <TableCell colSpan={6} className="py-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : enquiries.length === 0 ? (
              <TableRow className="border-none">
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No recent enquiries found
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enq) => (
                <TableRow key={enq._id} className="border-none group">
                  <TableCell className="font-medium py-4">{enq.name}</TableCell>
                  <TableCell className="text-muted-foreground py-4">{enq.email}</TableCell>
                  <TableCell className="text-muted-foreground py-4">{enq.phone}</TableCell>
                  <TableCell className="py-4">{enq.service}</TableCell>
                  <TableCell className="text-muted-foreground py-4">{formatRelativeTime(enq.createdAt)}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className={cn("rounded-lg shadow-none font-medium px-2 py-0.5", statusStyles[enq.status])}>
                      {enq.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
