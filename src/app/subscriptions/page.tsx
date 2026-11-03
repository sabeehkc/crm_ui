"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Download,
  Mail,
  Users,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  MailOpen,
  Trash2,
  Ban,
  TrendingUp,
  BarChart,
  Filter,
  Send,
  MousePointerClick,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  useListSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionStatusMutation,
  useDeleteSubscriptionMutation,
} from "@/store/services/subscriptionSlice";
import { BASE_URL, SUBSCRIPTIONS_URL } from "@/store/constants";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { ISubscription, SubscriptionStatus } from "@/types/subscription";

export default function SubscriptionManagementPage() {
  // Filter States
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // API Queries
  const { data: subsRes, isLoading: isListLoading } = useListSubscriptionsQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusFilter === "All" ? undefined : statusFilter,
  });

  const { data: statsRes } = useGetSubscriptionStatsQuery();

  // API Mutations
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [updateStatus] = useUpdateSubscriptionStatusMutation();
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();

  // Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  // Computed Values
  const listData = subsRes?.data?.items || [];
  const totalResults = subsRes?.data?.total || 0;
  const totalPages = subsRes?.data?.totalPages || 1;
  
  const stats = statsRes?.data || {
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0,
    newToday: 0,
  };

  // Formatting / Badge Utility
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium rounded-full shadow-none">Active</Badge>;
      case "Unsubscribed":
        return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 rounded-full">Unsubscribed</Badge>;
      case "Bounced":
        return <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 rounded-full shadow-none">Bounced</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Handlers
  const handleAddSubscriber = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and Email fields are compulsory.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await createSubscription({
        name: newName.trim(),
        email: newEmail.trim(),
        tags,
        source: "Manual",
        status: "Active",
      }).unwrap();

      toast.success("News letter enrolled successfully!");
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setTagsInput("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Operation blocked. Email might be a duplicate.");
    }
  };

  const handleToggleStatus = async (id: string, status: SubscriptionStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Subscriber transition complete: ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Operation execution failed.");
    }
  };

  const triggerDeleteModal = (id: string) => {
    setSubToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subToDelete) return;
    try {
      await deleteSubscription(subToDelete).unwrap();
      toast.success("Index destroyed completely.");
      setIsDeleteModalOpen(false);
      setSubToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not expunge target subscriber.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const statusParam = statusFilter !== "All" ? `?status=${statusFilter}` : "";
      
      const response = await fetch(`${BASE_URL}${SUBSCRIPTIONS_URL}/export${statusParam}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Network protocol error during CSV serialization.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `subscriptions_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Dataset exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Data mining interrupted. Export failed.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">News Letters</h1>
             <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
               Manage list growth, email audiences, and delivery health.
             </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl gap-2 shadow-xs border-slate-200" onClick={handleExportCsv}>
                <Download className="w-4 h-4" /> Export CSV
             </Button>
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
               <DialogTrigger asChild>
                 <Button className="rounded-xl bg-primary shadow-md shadow-primary/10 px-5 font-semibold gap-2">
                    <UserPlus className="w-4 h-4" /> Add News Letter
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl">
                  <DialogHeader className="mb-4">
                     <DialogTitle className="text-xl font-bold">Manually Enroll User</DialogTitle>
                     <DialogDescription>Adding a user manually triggers double opt-in validation if enabled.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <Label>Full Name</Label>
                        <Input 
                          placeholder="e.g. John Doe" 
                          className="rounded-xl h-11" 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <Label>Email Address</Label>
                        <Input 
                          type="email" 
                          placeholder="john@company.com" 
                          className="rounded-xl h-11" 
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <Label>Tags <span className="text-xs font-normal text-muted-foreground">(Comma separated)</span></Label>
                        <Input 
                          placeholder="e.g. newsletter, premium-plan" 
                          className="rounded-xl" 
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center justify-between pt-2 border-t mt-4">
                        <div className="space-y-0.5">
                           <Label className="text-sm font-medium">Send Welcome Email</Label>
                           <p className="text-xs text-muted-foreground">Automatically send the default drip sequence.</p>
                        </div>
                        <Switch checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
                     </div>
                  </div>
                  <DialogFooter className="mt-6 gap-3 sm:gap-0">
                     <Button variant="ghost" className="rounded-xl font-medium" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                     <Button className="rounded-xl bg-primary" onClick={handleAddSubscriber} disabled={isCreating}>
                        {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Subscribe User
                     </Button>
                  </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* Main Metric Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
              <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20"><Users className="w-5 h-5 text-primary" /></div>
                 <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <TrendingUp className="w-2.5 h-2.5" /> Running
                 </div>
                 <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                       {stats.total.toLocaleString()}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                       Total Base
                    </p>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
              <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                 <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50"><MailOpen className="w-5 h-5 text-emerald-600" /></div>
                 <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                       {stats.active.toLocaleString()}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                       Active Engaged
                    </p>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
              <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                 <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50"><UserMinus className="w-5 h-5 text-amber-600" /></div>
                 <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                       {stats.unsubscribed.toLocaleString()}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                       Unsubscribed
                    </p>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
              <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"><CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" /></div>
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    Today
                 </span>
                 <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                       {stats.newToday.toLocaleString()}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                       New Enrolls
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
           {/* Left Content: Subscribers Table */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border border-slate-100 dark:border-slate-800/60 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
                 <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <Input 
                         placeholder="Search name or email..." 
                         className="pl-9 bg-muted/40 rounded-xl border-transparent h-10" 
                         value={searchTerm}
                         onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                       />
                    </div>
                    <div className="flex items-center gap-2">
                       <select 
                         className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm outline-none dark:bg-slate-900"
                         value={statusFilter}
                         onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                       >
                          <option value="All">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Unsubscribed">Unsubscribed</option>
                          <option value="Bounced">Bounced</option>
                       </select>
                       <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200"><Filter className="w-4 h-4" /></Button>
                    </div>
                 </div>

                 <div className="overflow-x-auto min-h-[350px]">
                    <Table>
                       <TableHeader className="bg-slate-50/50 dark:bg-slate-900/30">
                          <TableRow className="border-slate-100 dark:border-slate-800">
                             <TableHead className="pl-6 font-semibold py-4">Subscriber</TableHead>
                             <TableHead className="font-semibold">Source Origin</TableHead>
                             <TableHead className="font-semibold">Status</TableHead>
                             <TableHead className="font-semibold">Joined Date</TableHead>
                             <TableHead className="text-right pr-6">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {isListLoading ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center py-24">
                                   <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                      <Loader2 className="w-7 h-7 animate-spin text-primary" />
                                      <p className="text-xs">Streaming indexes...</p>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ) : listData.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                                   No subscribers fit selected criteria.
                                </TableCell>
                             </TableRow>
                          ) : (
                            listData.map((sub: ISubscription) => (
                              <TableRow key={sub._id} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 group transition-colors">
                                 <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <Avatar className="h-9 w-9 border rounded-full bg-primary/5">
                                          <AvatarFallback className="text-xs font-bold text-primary">{getInitials(sub.name)}</AvatarFallback>
                                       </Avatar>
                                       <div>
                                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{sub.name}</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">{sub.email}</p>
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{sub.source}</span>
                                 </TableCell>
                                 <TableCell>
                                    {getStatusBadge(sub.status)}
                                 </TableCell>
                                 <TableCell className="text-sm text-muted-foreground tabular-nums">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                 </TableCell>
                                 <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg transition-opacity"><MoreHorizontal className="w-4 h-4" /></Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                          <DropdownMenuLabel>Subscription Control</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {sub.status !== "Active" && (
                                            <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer" onClick={() => handleToggleStatus(sub._id, "Active")}><CheckCircle className="w-3.5 h-3.5" /> Set as Active</DropdownMenuItem>
                                          )}
                                          {sub.status === "Active" && (
                                            <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer" onClick={() => handleToggleStatus(sub._id, "Unsubscribed")}><Ban className="w-3.5 h-3.5" /> Force Unsubscribe</DropdownMenuItem>
                                          )}
                                          {sub.status !== "Bounced" && (
                                            <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer" onClick={() => handleToggleStatus(sub._id, "Bounced")}><Mail className="w-3.5 h-3.5" /> Mark Bounced</DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 rounded-lg cursor-pointer" onClick={() => triggerDeleteModal(sub._id)}><Trash2 className="w-3.5 h-3.5" /> Remove Permanent</DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </TableCell>
                              </TableRow>
                            ))
                          )}
                       </TableBody>
                    </Table>
                 </div>
                 <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Showing {Math.min((page - 1) * 10 + 1, totalResults)} to {Math.min(page * 10, totalResults)} of {totalResults} items</span>
                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                       <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                    </div>
                 </div>
              </Card>
           </div>

           {/* Right Section: Analytics / Campaign Helper */}
           <div className="space-y-6">
              {/* Campaigns Overview */}
              <Card className="border-none shadow-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                 <CardHeader className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                    <CardTitle className="text-base flex items-center gap-2"><BarChart className="w-4 h-4 text-primary" /> Latest Campaign Health</CardTitle>
                 </CardHeader>
                 <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><MailOpen className="w-3 h-3" /> Open Rate</span>
                          <span className="text-emerald-600 font-bold">34.2%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[34.2%]" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click Rate</span>
                          <span className="text-blue-600 font-bold">8.9%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[8.9%]" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Ban className="w-3 h-3" /> Bounce Rate</span>
                          <span className="text-slate-800 dark:text-slate-100">
                             {stats.total > 0 ? ((stats.bounced / stats.total) * 100).toFixed(1) : "0.0"}%
                          </span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-400 rounded-full" 
                            style={{ width: `${stats.total > 0 ? Math.min((stats.bounced / stats.total) * 100, 100) : 0}%` }} 
                          />
                       </div>
                    </div>
                    <Separator className="my-2 opacity-60" />
                    <Button className="w-full rounded-xl bg-slate-950 dark:bg-slate-100 dark:text-slate-950 text-white hover:bg-slate-800 gap-2 mt-1 font-medium">
                       <Send className="w-3.5 h-3.5" /> Launch New Broadcast
                    </Button>
                 </CardContent>
              </Card>

              {/* Simple Growth Tracker */}
              <Card className="border-none shadow-md rounded-2xl bg-linear-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-950 text-white relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                 <CardContent className="p-6 relative">
                    <h4 className="font-bold text-lg mb-1">Healthy List Growth</h4>
                    <p className="text-sm text-indigo-100/80 mb-4">Your subscriber base has grown faster than previous metrics.</p>
                    <div className="flex items-end gap-2">
                       <div className="h-8 w-1.5 bg-white/20 rounded-t-sm" />
                       <div className="h-12 w-1.5 bg-white/40 rounded-t-sm" />
                       <div className="h-10 w-1.5 bg-white/60 rounded-t-sm" />
                       <div className="h-14 w-1.5 bg-white/80 rounded-t-sm" />
                       <div className="h-20 w-1.5 bg-white rounded-t-sm shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSubToDelete(null); }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Terminate Subscription Index"
        description="Proceeding will expunge this subscriber permanently from active delivery pipelines."
      />
    </DashboardLayout>
  );
}
