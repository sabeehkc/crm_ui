"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
  Settings,
  Grid,
  List as ListIcon,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  useListFormsQuery,
  useDeleteFormMutation,
} from "@/store/services/formSlice";
import { FormCard } from "./components/FormCard";
import { CreateFormModal } from "./components/CreateFormModal";

export default function FormsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useListFormsQuery({ page, limit, search: searchTerm, isShareForm: false });
  const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();

  const forms = data?.data?.items || [];
  const pagination = data?.data;

  const handleCopyKey = (key: string) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard!");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteForm(deleteId).unwrap();
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };


  // No need to manually set local forms state, RTK Query auto-updates after mutation due to cache tags
  const handleAddForm = () => {};

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Forms
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage endpoints, view submissions, and connect integrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CreateFormModal onFormCreated={handleAddForm}>
              <Button className="rounded-full shadow-sm bg-primary gap-2 px-5">
                <Plus className="h-4 w-4" />
                Create Form
              </Button>
            </CreateFormModal>
          </div>
        </div>

        {/* Filters and Toggles Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms by name or domain..."
              className="pl-9 rounded-xl bg-white dark:bg-card shadow-sm border-border/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 shadow-sm self-end sm:self-auto">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("table")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted text-muted-foreground space-y-3 bg-muted/20 mx-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-card border rounded-3xl shadow-sm mx-2">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <LayoutDashboard className="h-10 w-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No forms found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm
                ? "Try adjusting your search term to find what you're looking for."
                : "Start generating leads by creating your first form management configuration."}
            </p>
            <CreateFormModal onFormCreated={handleAddForm}>
              <Button className="rounded-xl shadow-sm px-6 gap-2">
                <Plus className="h-4 w-4" /> Create First Form
              </Button>
            </CreateFormModal>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {forms.map((form) => (
              <FormCard key={form._id} form={form} onCopyKey={handleCopyKey} />
            ))}
          </div>
        ) : (
          <div className="border rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-card mx-2">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-4 px-6 font-semibold text-muted-foreground">
                    Form Name
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-muted-foreground">
                    Domain
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-muted-foreground hidden md:table-cell">
                    Access Email
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-muted-foreground text-center">
                    Submissions
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-muted-foreground hidden sm:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow
                    key={form._id}
                    className="group border-b-muted/50 hover:bg-muted/10 transition-colors"
                  >
                    <TableCell className="px-6 py-4 font-medium text-foreground">
                      <Link
                        href={`/forms/${form._id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {form.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-1.5 py-4 mt-1">
                      <span className="truncate max-w-[150px]">
                        {form.domain}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground py-4">
                      {form.notificationEmails[0] || "N/A"}
                    </TableCell>
                    <TableCell className="text-center py-4 font-medium">
                      {form.totalSubmissions}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground py-4 whitespace-nowrap">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2.5 py-0.5 border-transparent font-medium text-xs ${
                          form.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {form.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/forms/${form._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Manage"
                          >
                            <Settings className="h-6 w-6" /> 
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl p-1.5"
                          >
                            <DropdownMenuItem
                              className="rounded-lg gap-2 flex items-center py-2 cursor-pointer"
                              onClick={() => handleCopyKey(form.accessKey)}
                            >
                              <Copy className="h-3.5 w-3.5" /> Copy API Key
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="rounded-lg text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 gap-2 flex items-center py-2 cursor-pointer"
                              onClick={() => setDeleteId(form._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="text-xs text-muted-foreground font-medium">
              Showing <span className="text-foreground">{(page - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(page * limit, pagination.total)}</span> of <span className="text-foreground">{pagination.total}</span> forms
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-xl border-border/60 text-xs"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <div className="flex items-center gap-1.5">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 rounded-xl p-0 text-xs ${page === i + 1 ? 'shadow-sm' : 'border-border/60'}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-xl border-border/60 text-xs"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] p-6 border-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Delete Form Endpoint?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently remove this endpoint configuration and its incoming pipelines. All related submissions data remains preserved unless manually expunged. This action cannot be reversed.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-slate-200 dark:border-slate-700 bg-transparent font-medium rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium min-w-[100px] rounded-xl"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
