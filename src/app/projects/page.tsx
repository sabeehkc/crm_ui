"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
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
import {
  ClipboardList,
  Zap,
  CheckSquare,
  Bug,
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit
} from "lucide-react";
import { NewProjectModal } from "./components/NewProjectModal";
import { useListProjectsQuery } from "@/store/services/projectSlice";
import { ProjectStatus } from "@/types/project";

const getProgressColor = (prog: number) => {
  if (prog >= 90) return "bg-emerald-500";
  if (prog >= 50) return "bg-[#c24141]";
  return "bg-yellow-500";
};

const getStatusStyles = (status: ProjectStatus) => {
  switch(status) {
    case 'Completed': return "text-emerald-600 dark:text-emerald-400";
    case 'In Progress': return "text-[#c24141]";
    case 'Nearly Done': return "text-blue-500";
    case 'Just Started': return "text-yellow-600 dark:text-yellow-400";
    case 'On Hold': return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
};

const getClientInit = (name: string) => name.charAt(0).toUpperCase();

const CLIENT_COLORS = ["bg-orange-500", "bg-red-500", "bg-blue-500", "bg-purple-500", "bg-indigo-500"];
const getClientColor = (name: string) => {
  const charCode = name.charCodeAt(0);
  return CLIENT_COLORS[charCode % CLIENT_COLORS.length];
};

const TEAM_COLORS = ["bg-yellow-500", "bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-indigo-500", "bg-emerald-500"];
const getTeamColor = (idx: number) => TEAM_COLORS[idx % TEAM_COLORS.length];

const summaryCards = [
  {
    title: "Total Projects",
    count: "7",
    icon: ClipboardList,
    color: "text-orange-200",
    bg: "bg-[#2a221f]",
  },
  {
    title: "In Progress",
    count: "4",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-[#1f2638]",
  },
  {
    title: "Completed",
    count: "1",
    icon: CheckSquare,
    color: "text-white",
    bg: "bg-green-600",
  },
  {
    title: "Open Bugs",
    count: "4",
    icon: Bug,
    color: "text-green-500",
    bg: "bg-[#381f1f]",
  },
];



export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projectResponse, isLoading, error } = useListProjectsQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter
  });

  const projects = projectResponse?.data?.items || [];
  const pagination = projectResponse?.data;

  // Dynamic summaries based on current dataset if possible, otherwise could remain placeholder
  const liveSummary = [
    { ...summaryCards[0], count: pagination?.total || 0 },
    { ...summaryCards[1], count: projects.filter(p => p.status === 'In Progress').length },
    { ...summaryCards[2], count: projects.filter(p => p.status === 'Completed').length },
    { ...summaryCards[3], count: projects.reduce((a, b) => a + (b.bugsCount || 0), 0) || 0 },
  ];


  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6 max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Projects
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pagination?.total || 0} projects found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-lg bg-transparent border-muted/50 h-10 px-4"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button
              onClick={() => { setProjectToEdit(null); setIsModalOpen(true); }}
              className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white h-10 px-4 border-none shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {liveSummary.map((card, idx) => (
            <Card
              key={idx}
              className="bg-card border-none rounded-xl p-4 shadow-sm flex items-center min-h-[80px]"
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.bg}`}
                >
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="flex items-center gap-2 justify-end flex-1">
                  <h3 className="text-xl font-bold text-foreground leading-none m-0">
                    {card.count}
                  </h3>
                  <p className="text-[13px] font-medium text-muted-foreground m-0">
                    {card.title}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="w-full bg-card border border-border rounded-2xl px-3 py-2 flex items-center gap-3 shadow-sm">
          {/* Search Section */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search projects or clients..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="
        w-full
        h-11
        pl-10 pr-3
        rounded-xl
        bg-muted/40
        border-none
        focus-visible:ring-1
        focus-visible:ring-primary/20
        shadow-none
      "
            />
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Filter Section */}
          <div className="w-32">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="
        w-full
        h-11
        px-2
        text-sm
        bg-transparent
        border-none
        outline-none
        cursor-pointer
        text-muted-foreground
      "
            >
              <option value="all">All</option>
              <option value="In Progress">In Progress</option>
              <option value="Nearly Done">Nearly Done</option>
              <option value="Just Started">Just Started</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm flex-1">
          <Table>
            <TableHeader className="bg-[#f4f6fb] dark:bg-slate-900">
              <TableRow className="border-b border-muted/30 hover:bg-transparent">
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Project
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Client
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Budget
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Progress
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Due Date
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  Bugs
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                   <TableCell colSpan={9} className="h-[300px] text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                         <Loader2 className="h-6 w-6 animate-spin" />
                         Loading projects...
                      </div>
                   </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                   <TableCell colSpan={9} className="h-[200px] text-center text-red-500 font-medium">
                      Failed to load projects. Please try again later.
                   </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={9} className="h-[200px] text-center text-muted-foreground">
                      No projects found matching selected criteria.
                   </TableCell>
                </TableRow>
              ) : (
               projects.map((proj) => (
                <TableRow
                  key={proj._id}
                  className="border-b border-muted/20 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-foreground mb-1">
                      {proj.name}
                    </div>
                    <div className="flex gap-2">
                      {proj.tags && proj.tags.length > 0 ? proj.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-[11px] font-medium ${i === 0 ? "text-[#c24141]" : "text-muted-foreground"}`}
                        >
                          {tag}
                        </span>
                      )) : <span className="text-[11px] text-muted-foreground">No Tags</span>}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getClientColor(proj.client)}`}
                      >
                        {getClientInit(proj.client)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {proj.client}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold text-foreground text-sm">
                    ₹{(proj.budget/1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 bg-muted/30 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${getProgressColor(proj.progress)}`}
                          style={{ width: `${proj.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {proj.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(proj.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold ${getStatusStyles(proj.status)}`}
                    >
                      {proj.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`text-xs font-semibold ${proj.bugsCount ? 'text-[#c24141]' : 'text-muted-foreground'}`}>
                      {proj.bugsCount || 0} open
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProjectToEdit(proj);
                          setIsModalOpen(true);
                        }}
                        className="rounded-full h-8 w-8 p-0 text-muted-foreground hover:bg-muted/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Link href={`/projects/${proj._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs h-8 px-4 bg-transparent border-muted/50 hover:bg-muted/30 text-foreground"
                        >
                          View &rarr;
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-muted/20 flex items-center justify-between text-sm text-muted-foreground">
            <div>
               Showing {(currentPage - 1) * (pagination?.limit || 20) + 1} - {Math.min(currentPage * (pagination?.limit || 20), pagination?.total || 0)} of {pagination?.total || 0}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted/30 text-muted-foreground"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="px-3 font-medium text-foreground">Page {currentPage} of {pagination?.totalPages || 1}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted/30 text-muted-foreground"
                disabled={!pagination || currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <NewProjectModal open={isModalOpen} onOpenChange={(o) => {setIsModalOpen(o); if(!o) setProjectToEdit(null);}} projectToEdit={projectToEdit} />
    </DashboardLayout>
  );
}
