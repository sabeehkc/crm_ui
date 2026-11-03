"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  Plus,
  Search,
  ChevronDown,
  Paperclip,
  Pencil,
  Trash2,
  Receipt,
  CalendarDays,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  useListExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/store/services/expenseSlice";
import { IExpense } from "@/types/expense";
import { BASE_URL } from "@/store/constants";
import toast from "react-hot-toast";

const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);
};

const formatCompact = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

const getCatColor = (cat: string) => {
  const map: Record<string, string> = {
    Payroll: "#5b61f4",
    Operations: "#5096f2",
    Tools: "#48b472",
    Marketing: "#f08a38",
    Infrastructure: "#94a3b8",
    "HR & Culture": "#ef4444",
  };
  return map[cat] || "#64748b";
};

export default function ExpensesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: listRes, isLoading: isLoadingList } = useListExpensesQuery({
    page,
    limit,
    category: filterCategory === "All" ? undefined : filterCategory,
    search,
  });
  const { data: summaryRes } = useGetExpenseSummaryQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<IExpense | null>(null);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Operations",
    mode: "Bank Transfer",
    notes: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  const openEdit = (item: IExpense) => {
    setEditingItem(item);
    setIsReplacingFile(false);
    setForm({
      description: item.description,
      amount: String(item.amount),
      date: new Date(item.date).toISOString().split("T")[0],
      category: item.category,
      mode: item.mode,
      notes: item.notes || "",
    });
    setIsAddModalOpen(true);
  };

  const closeForm = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setIsReplacingFile(false);
    setForm({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "Operations",
      mode: "Bank Transfer",
      notes: "",
    });
    setProofFile(null);
  };

  const handleSubmit = async () => {
    if (!form.description || !form.amount) {
      toast.error("Fill basic details");
      return;
    }
    const formData = new FormData();
    formData.append("description", form.description);
    formData.append("amount", form.amount);
    formData.append("date", form.date);
    formData.append("category", form.category);
    formData.append("mode", form.mode);
    if (form.notes) formData.append("notes", form.notes);
    if (proofFile) formData.append("expenseProof", proofFile);

    try {
      if (editingItem) {
        await updateExpense({ id: editingItem._id, data: formData }).unwrap();
        toast.success("Expense record refined.");
      } else {
        await createExpense(formData).unwrap();
        toast.success("New expense logged.");
      }
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error("Action failed to write.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense(deleteId).unwrap();
      setDeleteId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const ledger = listRes?.data?.items || [];
  const summary = summaryRes?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Company Expenses
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track all business expenditure with proofs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="font-medium text-slate-700 dark:text-slate-300 dark:border-slate-700 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                closeForm();
                setIsAddModalOpen(true);
              }}
              className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>

            <Dialog
              open={isAddModalOpen}
              onOpenChange={(v) => (v ? null : closeForm())}
            >
              <DialogContent className="sm:max-w-[500px] p-0 border-0 shadow-xl overflow-hidden rounded-xl dark:bg-slate-900">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {editingItem ? "Edit Expense" : "Add Company Expense"}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Description
                    </label>
                    <Input
                      required
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="e.g. AWS Hosting"
                      className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Amount (₹)
                      </label>
                      <Input
                        type="number"
                        required
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        placeholder="5000"
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Date
                      </label>
                      <Input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Tools">Tools</option>
                      <option value="Operations">Operations</option>
                      <option value="HR & Culture">HR & Culture</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Payment Mode
                    </label>
                    <select
                      value={form.mode}
                      onChange={(e) =>
                        setForm({ ...form, mode: e.target.value })
                      }
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Auto Debit">Auto Debit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Proof (optional)</span>
                      {editingItem?.proofDocument && (
                        <a 
                          href={`${BASE_URL}${editingItem.proofDocument}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[11px] text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          <Paperclip className="w-3 h-3" /> View Current
                        </a>
                      )}
                    </label>
                    {editingItem?.proofDocument && !isReplacingFile ? (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 font-semibold">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          Existing File Attached
                        </div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsReplacingFile(true)}
                          className="h-8 text-xs border-slate-200 dark:border-slate-600 font-medium shadow-none bg-white dark:bg-slate-900"
                        >
                          Replace File
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] || null)
                        }
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
                <DialogFooter className="px-6 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={closeForm}
                    className="border-slate-200 dark:border-slate-700 dark:text-slate-300 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isCreating || isUpdating}
                    className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium min-w-[120px]"
                    onClick={handleSubmit}
                  >
                    {isCreating || isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : editingItem ? (
                      "Update Expense"
                    ) : (
                      "Save Expense"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 space-y-4">
            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
                <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fdf2f8] dark:bg-pink-900/20 flex items-center justify-center shrink-0 border border-pink-100/50 dark:border-pink-900/50">
                    <Receipt className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                      {formatCompact(summary?.total || 0)}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                      Grand Total Expense
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
                <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fff7ed] dark:bg-orange-900/20 flex items-center justify-center shrink-0 border border-orange-100/50 dark:border-orange-900/50">
                    <CalendarDays className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                      {summary?.byCategory?.length || 0}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                      Cost Categories
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
                <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] dark:bg-green-900/20 flex items-center justify-center shrink-0 border border-green-100/50 dark:border-green-900/50">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center gap-2 justify-end flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                      {ledger.length}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                      Entries recorded
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Categories Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(summary?.byCategory || []).slice(0, 3).map((cat, idx) => (
                <Card
                  key={idx}
                  className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900"
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-base">
                        {cat.category}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
                        ₹{cat.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">
                      {cat.percentage}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* By Category Card */}
          <div className="xl:col-span-1">
            <Card className="h-full shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex flex-col">
              <CardHeader className="pb-3 pt-4 px-6 shrink-0">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="space-y-4 pr-1">
                {(summary?.byCategory || []).map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {cat.category}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        ₹{cat.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.max(2, cat.percentage)}%`,
                          backgroundColor: getCatColor(cat.category),
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {(!summary?.byCategory || summary.byCategory.length === 0) && (
                  <p className="text-slate-400 text-xs text-center py-4">
                    No data yet
                  </p>
                )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expense Ledger */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-6 pb-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Expense Ledger
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                  placeholder="Search..."
                />
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-10 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="All">All Categories</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Tools">Tools</option>
                  <option value="Operations">Operations</option>
                  <option value="HR & Culture">HR & Culture</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800">
                  <TableHead className="w-[50px] text-slate-500 dark:text-slate-400 font-medium py-4 px-6">
                    #
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Description
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Category
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Amount
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Date
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Mode
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">
                    Proof
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 text-right px-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : ledger.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-slate-400"
                    >
                      No expenses recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((item, idx) => (
                    <TableRow
                      key={item._id}
                      className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <TableCell className="font-medium text-slate-500 dark:text-slate-400 px-6 py-4">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 dark:text-slate-200 py-4">
                        {item.description}
                      </TableCell>
                      <TableCell className="py-4">
                        {item.category === "Infrastructure" && (
                          <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-500 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Infrastructure
                          </Badge>
                        )}
                        {item.category === "Tools" && (
                          <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Tools
                          </Badge>
                        )}
                        {item.category === "Operations" && (
                          <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Operations
                          </Badge>
                        )}
                        {item.category === "Payroll" && (
                          <Badge className="bg-violet-50 hover:bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 dark:text-violet-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Payroll
                          </Badge>
                        )}
                        {item.category === "Marketing" && (
                          <Badge className="bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Marketing
                          </Badge>
                        )}
                        {item.category === "HR & Culture" && (
                          <Badge className="bg-pink-50 hover:bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 dark:text-pink-400 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            HR & Culture
                          </Badge>
                        )}
                        {item.category === "Other" && (
                          <Badge className="bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 shadow-none border-0 font-semibold px-2.5 py-0.5">
                            Other
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-[#c23b22] dark:text-[#e0523b] py-4">
                        ₹{item.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 font-medium py-4">
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 font-medium py-4">
                        {item.mode}
                      </TableCell>
                      <TableCell className="py-4">
                        {item.proofDocument ? (
                          <a
                            href={`${BASE_URL}${item.proofDocument}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-2">
                            No proof
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(item)}
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item._id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {listRes?.data && listRes.data.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-700 dark:text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * limit, listRes.data.total)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{listRes.data.total}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(listRes.data.totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 rounded-lg p-0 ${page === i + 1 ? 'bg-[#c23b22] hover:bg-[#a6321d]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  onClick={() => setPage(p => Math.min(listRes.data.totalPages, p + 1))}
                  disabled={page === listRes.data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] p-6 border-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Delete Expense Record?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently remove this expense entry and its data. This
            action cannot be reversed.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-slate-200 dark:border-slate-700 bg-transparent font-medium"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium min-w-[100px]"
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
