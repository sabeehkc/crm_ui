"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  UserCheck,
  User,
  Briefcase,
  Layers,
  FileText,
  DollarSign,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";
import {
  useListTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/store/services/taskSlice";
import { useGetUsersQuery } from "@/store/services/userSlice";
import { ITask, TaskStatus } from "@/types/task";
import toast from "react-hot-toast";

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  Pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    icon: Clock,
  },
  "In Progress": {
    label: "In Progress",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    icon: PlayCircle,
  },
  Done: {
    label: "Done",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const activityOptions = ["Web", "Design", "SEO", "Content", "Marketing", "Other"];
const divisionOptions = ["Web", "Design", "SEO", "Mobile", "QA", "Other"];
const clientStatusOptions = ["Pending", "In Review", "Approved", "Revision", "Completed"];
const billingOptions = ["Billable", "Non-Billable", "Billed", "Paid"];

export default function TasksPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = currentUser?.role === "admin";
  const canCreate = isAdmin || currentUser?.permissions?.tasks?.create;
  const canEdit = isAdmin || currentUser?.permissions?.tasks?.edit;
  const canDelete = isAdmin || currentUser?.permissions?.tasks?.delete;

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterDivision, setFilterDivision] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Form State structured into 4 sections
  // Section 1: Client Name, Date, Activity
  const [clientName, setClientName] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [activity, setActivity] = useState("Web");

  // Section 2: Division, Work Detail
  const [division, setDivision] = useState("Web");
  const [workDetail, setWorkDetail] = useState("");

  // Section 3: Allotted By, Allotted To, Allotted Date, Target Date, Completed Date
  const [allottedBy, setAllottedBy] = useState("");
  const [allottedTo, setAllottedTo] = useState("");
  const [allottedDate, setAllottedDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");

  // Section 4: Status, Client Status, Billing, Remarks
  const [status, setStatus] = useState<TaskStatus>("Pending");
  const [clientStatus, setClientStatus] = useState("Pending");
  const [billing, setBilling] = useState("Billable");
  const [remarks, setRemarks] = useState("");

  // API Queries & Mutations
  const { data: tasksRes, isLoading } = useListTasksQuery({
    page,
    limit,
    status: filterStatus === "All" ? undefined : filterStatus,
    division: filterDivision === "All" ? undefined : filterDivision,
    search,
  });

  const { data: usersRes } = useGetUsersQuery({ limit: 100 });
  const usersList = usersRes?.data?.items || [];

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const taskList = tasksRes?.data?.items || [];
  const counts = tasksRes?.data?.counts || {
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
  };
  const totalPages = tasksRes?.data?.totalPages || 1;

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setClientName("");
    setTaskDate(today);
    setActivity("Web");

    setDivision("Web");
    setWorkDetail("");

    setAllottedBy(currentUser?._id || "");
    setAllottedTo("");
    setAllottedDate(today);
    setTargetDate("");
    setCompletedDate("");

    setStatus("Pending");
    setClientStatus("Pending");
    setBilling("Billable");
    setRemarks("");

    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (task: ITask) => {
    setEditingTask(task);
    setClientName(task.clientName || "");
    setTaskDate(task.date || (task.createdAt ? task.createdAt.split("T")[0] : ""));
    setActivity(task.activity || "Web");

    setDivision(task.division || "Web");
    setWorkDetail(task.workDetail || task.description || task.taskDescription || task.title || "");

    setAllottedBy(task.allottedBy?._id || task.createdBy?._id || currentUser?._id || "");
    setAllottedTo(task.allottedTo?._id || task.assignedTo?._id || "");
    setAllottedDate(task.allottedDate || task.date || "");
    setTargetDate(task.targetDate || "");
    setCompletedDate(task.completedDate || "");

    setStatus(task.status || "Pending");
    setClientStatus(task.clientStatus || "Pending");
    setBilling(task.billing || "Billable");
    setRemarks(task.remarks || "");

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error("Please enter a client name");
      return;
    }

    if (!workDetail.trim()) {
      toast.error("Please enter work details");
      return;
    }

    try {
      const payload = {
        clientName: clientName.trim(),
        date: taskDate,
        activity,
        division,
        workDetail: workDetail.trim(),
        title: `${clientName.trim()} - ${activity}`,
        description: workDetail.trim(),
        allottedBy: allottedBy || undefined,
        allottedTo: allottedTo || undefined,
        allottedDate: allottedDate || taskDate,
        targetDate,
        completedDate,
        status,
        clientStatus,
        billing,
        remarks: remarks.trim(),
      };

      if (editingTask) {
        await updateTask({
          id: editingTask._id,
          data: payload,
        }).unwrap();
        toast.success("Task updated successfully");
      } else {
        await createTask(payload).unwrap();
        toast.success("Task created successfully");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save task");
    }
  };

  const handleQuickStatusChange = async (task: ITask, newStatus: TaskStatus) => {
    if (!canEdit) return;
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "Done" && !task.completedDate) {
        updateData.completedDate = new Date().toISOString().split("T")[0];
      }
      await updateTask({
        id: task._id,
        data: updateData,
      }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error("Failed to update task status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId).unwrap();
      toast.success("Task deleted successfully");
      setDeleteTaskId(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete task");
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-primary" />
              Tasks
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Organize, allot, and monitor work assignments across divisions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Button
                onClick={openAddModal}
                className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors rounded-xl px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Tasks
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {counts.total}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <CheckSquare className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {counts.pending}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  In Progress
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {counts.inProgress}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Completed
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {counts.done}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Pending", "In Progress", "Done"].map((s) => {
              const isActive = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {s}
                  {s === "Pending" && counts.pending > 0 && ` (${counts.pending})`}
                  {s === "In Progress" &&
                    counts.inProgress > 0 &&
                    ` (${counts.inProgress})`}
                  {s === "Done" && counts.done > 0 && ` (${counts.done})`}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Division Filter */}
            <select
              value={filterDivision}
              onChange={(e) => {
                setFilterDivision(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
            >
              <option value="All">All Divisions</option>
              {divisionOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks, clients..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Task List / Table */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                Loading tasks...
              </p>
            </div>
          ) : taskList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                No tasks found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {search || filterDivision !== "All"
                  ? "No tasks match your search or filter criteria. Try adjusting filters."
                  : "There are no tasks logged yet. Create your first task to get started."}
              </p>
              {canCreate && !search && (
                <Button
                  onClick={openAddModal}
                  className="mt-5 bg-[#c23b22] hover:bg-[#a6321d] text-white rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="py-3 px-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Client & Work Detail
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Division / Activity
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Allotted
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Timeline
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Status & Billing
                    </TableHead>
                    {(canEdit || canDelete) && (
                      <TableHead className="py-3 px-5 text-xs font-semibold text-slate-600 dark:text-slate-300 text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {taskList.map((task) => {
                    const cfg = statusConfig[task.status] || statusConfig.Pending;
                    const StatusIcon = cfg.icon;

                    const allotter = task.allottedBy || task.createdBy;
                    const assignee = task.allottedTo || task.assignedTo;

                    return (
                      <TableRow
                        key={task._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors group"
                      >
                        {/* Section 1 & 2: Client Name & Work Detail */}
                        <TableCell className="py-4 px-5">
                          <div className="max-w-md space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {task.clientName || "General Client"}
                              </span>
                              {task.date && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3 opacity-60" />
                                  {task.date}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {task.workDetail || task.description || task.title || "No work details provided"}
                            </p>
                            {task.remarks && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/50 w-fit flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {task.remarks}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Division & Activity */}
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start text-xs">
                            {task.division && (
                              <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 font-semibold text-[11px] px-2 py-0.5 rounded-lg shadow-none flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {task.division}
                              </Badge>
                            )}
                            {task.activity && (
                              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium text-[11px] px-2 py-0.5 rounded-lg shadow-none">
                                {task.activity}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Section 3: Allotted By & Allotted To */}
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground w-6">
                                By:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-[9px] font-bold">
                                    {getUserInitials(allotter?.name, allotter?.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {allotter?.name || "Admin"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground w-6">
                                To:
                              </span>
                              {assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                                      {getUserInitials(assignee?.name, assignee?.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-blue-700 dark:text-blue-300">
                                    {assignee.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Section 3: Timeline (Allotted, Target, Completed) */}
                        <TableCell className="py-4 px-4 whitespace-nowrap text-xs">
                          <div className="space-y-1">
                            {task.allottedDate && (
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                                <span className="text-muted-foreground">Allotted:</span>
                                <span>{task.allottedDate}</span>
                              </div>
                            )}
                            {task.targetDate && (
                              <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                                <Calendar className="w-3 h-3 text-amber-500" />
                                <span>Target: {task.targetDate}</span>
                              </div>
                            )}
                            {task.completedDate && (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                                <CalendarCheck className="w-3 h-3" />
                                <span>Done: {task.completedDate}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Section 4: Status & Billing */}
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1.5">
                            {canEdit ? (
                              <div className="inline-block relative">
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    handleQuickStatusChange(
                                      task,
                                      e.target.value as TaskStatus
                                    )
                                  }
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Done">Done</option>
                                </select>
                                <StatusIcon className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                              </div>
                            ) : (
                              <Badge
                                className={`border ${cfg.bg} ${cfg.text} ${cfg.border} font-semibold text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 w-fit shadow-none`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {cfg.label}
                              </Badge>
                            )}

                            <div className="flex items-center gap-1.5 text-[11px]">
                              {task.clientStatus && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                  {task.clientStatus}
                                </span>
                              )}
                              {task.billing && (
                                <span
                                  className={`px-1.5 py-0.5 rounded font-medium ${
                                    task.billing === "Billable"
                                      ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {task.billing}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        {(canEdit || canDelete) && (
                          <TableCell className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(task)}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg"
                                  title="Edit Task"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteTaskId(task._id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg h-8 text-xs font-medium"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg h-8 text-xs font-medium"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add / Edit Task Modal with 4 Organized Sections */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[620px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden dark:bg-slate-900">
            <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                {editingTask ? "Edit Task" : "Add Task"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6 bg-white dark:bg-slate-900 max-h-[75vh] overflow-y-auto">
                {/* ── SECTION 1: Client Information ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Section 1: Client & Activity Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Client Name */}
                    <div className="sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="h-9 text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        className="h-9 text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    {/* Activity */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Activity
                      </label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {activityOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: Division & Work Detail ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <Layers className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Section 2: Division & Work Detail
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Division */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Division
                      </label>
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {divisionOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Work Detail */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Work Detail <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        required
                        value={workDetail}
                        onChange={(e) => setWorkDetail(e.target.value)}
                        placeholder="Describe the exact task requirements, deliverables, or bug notes..."
                        className="min-h-[85px] text-xs resize-none border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: Allocation & Timeline ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Section 3: Allocation & Timeline
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Allotted By */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allotted By
                      </label>
                      <select
                        value={allottedBy}
                        onChange={(e) => setAllottedBy(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select Allotter</option>
                        {currentUser && (
                          <option value={currentUser._id}>
                            {currentUser.name || currentUser.email} (You)
                          </option>
                        )}
                        {usersList
                          .filter((u) => u._id !== currentUser?._id)
                          .map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name || u.email} ({u.role})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Allotted To */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allotted To
                      </label>
                      <select
                        value={allottedTo}
                        onChange={(e) => setAllottedTo(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select Assignee</option>
                        {usersList.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name || u.email} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Allotted Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allotted Date
                      </label>
                      <Input
                        type="date"
                        value={allottedDate}
                        onChange={(e) => setAllottedDate(e.target.value)}
                        className="h-9 text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    {/* Target Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Target Date
                      </label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="h-9 text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    {/* Completed Date */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Completed Date <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input
                        type="date"
                        value={completedDate}
                        onChange={(e) => setCompletedDate(e.target.value)}
                        className="h-9 text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 4: Status, Client Status, Billing & Remarks ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Section 4: Status, Billing & Remarks
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    {/* Client Status */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Client Status
                      </label>
                      <select
                        value={clientStatus}
                        onChange={(e) => setClientStatus(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {clientStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Billing */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Billing
                      </label>
                      <select
                        value={billing}
                        onChange={(e) => setBilling(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {billingOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remarks */}
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Remarks
                      </label>
                      <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Any special remarks, client feedback, or notes..."
                        className="min-h-[65px] text-xs resize-none border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-[#c23b22] hover:bg-[#a6321d] text-white rounded-xl shadow-sm text-xs h-9 px-5"
                >
                  {(isCreating || isUpdating) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deleteTaskId}
          onOpenChange={(v) => (v ? null : setDeleteTaskId(null))}
        >
          <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 dark:bg-slate-900 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Delete Task?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTaskId(null)}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-9"
              >
                {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
