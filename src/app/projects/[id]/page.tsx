'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, User, Calendar, IndianRupee, Users, CheckCircle2, Circle, Check, Plus, Loader2, Edit, ChevronDown } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { AddMilestoneModal } from './components/AddMilestoneModal'
import { ReportBugModal } from './components/ReportBugModal'
import { AddTaskModal } from './components/AddTaskModal'
import { useGetProjectDetailsQuery, useGetMilestonesQuery, useGetBugsQuery, useUpdateTaskMutation, useUpdateProjectMutation, useUpdateProjectProgressMutation } from '@/store/services/projectSlice'

export default function ProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [activeTab, setActiveTab] = useState<'milestones'|'bugs'>('milestones')
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false)
  const [reportBugOpen, setReportBugOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  
  const [selectedMilestone, setSelectedMilestone] = useState<{id: string, title: string} | null>(null)
  const [milestoneToEdit, setMilestoneToEdit] = useState<any | null>(null)
  const [bugToEdit, setBugToEdit] = useState<any | null>(null)

  // Real API calls
  const { data: projRes, isLoading: isProjLoading } = useGetProjectDetailsQuery(projectId, { skip: !projectId })
  const { data: milestonesRes, isLoading: isMilestoneLoading } = useGetMilestonesQuery(projectId, { skip: !projectId })
  const { data: bugsRes, isLoading: isBugsLoading } = useGetBugsQuery(projectId, { skip: !projectId })

  const [updateTask] = useUpdateTaskMutation()
  const [updateProject] = useUpdateProjectMutation()
  const [updateProjectProgress] = useUpdateProjectProgressMutation()

  const handleTaskStatusChange = async (milestoneId: string, taskId: string, newStatus: 'Pending' | 'In Progress' | 'Done') => {
    try {
      await updateTask({ projectId, milestoneId, taskId, data: { status: newStatus } }).unwrap()
    } catch (err) {
      console.error('Failed to update task status', err)
    }
  }

  const project = projRes?.data
  const milestones = milestonesRes?.data || []
  const bugs = bugsRes?.data?.items || []

  // Calculate dynamic summary metrics
  const totalTasks = milestones.reduce((sum, m) => sum + (m.tasks?.length || 0), 0)
  const doneTasks = milestones.reduce((sum, m) => sum + (m.tasks?.filter((t:any) => t.status === 'Done').length || 0), 0)
  const resolvedBugs = bugs?.filter(b => b.status === 'Resolved').length
  const openBugs = bugs?.length - resolvedBugs

  useEffect(() => {
    if (project && !isMilestoneLoading && !isBugsLoading) {
      const newProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
      
      let newStatus = project.status
      if (newProgress === 0) newStatus = 'Just Started'
      else if (newProgress > 0 && newProgress < 90) newStatus = 'In Progress'
      else if (newProgress >= 90 && newProgress < 100) newStatus = 'Nearly Done'
      else if (newProgress === 100 && openBugs === 0) newStatus = 'Completed'

      if (newProgress !== project.progress) {
        updateProjectProgress({ id: projectId, progress: newProgress })
      }
      if (newStatus !== project.status) {
        updateProject({ id: projectId, data: { status: newStatus } })
      }
    }
  }, [totalTasks, doneTasks, openBugs, project, isMilestoneLoading, isBugsLoading, projectId, updateProjectProgress, updateProject])

  if (isProjLoading) {
    return (
      <DashboardLayout>
         <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#c24141]" />
         </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
         <div className="p-8 text-center text-muted-foreground">Project not found.</div>
      </DashboardLayout>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-full mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/projects')} className="rounded-full h-8 px-4 bg-white dark:bg-card border-border shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {project.name}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-[#c24141] dark:bg-red-900/30">{project.status}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium pl-2">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> {project.client}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.dueDate).toLocaleDateString()}</div>
            <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4" /> ₹{project.budget.toLocaleString()}</div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="bg-card border-none rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-foreground text-sm">Overall Progress</h3>
            <span className="font-bold text-[#c24141] text-sm">{project.progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden mb-1 flex">
            <div className="h-full bg-[#c24141]" style={{ width: `${project.progress}%` }}></div>
          </div>
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Milestones</p>
              <p className="font-bold text-foreground text-[13px]">{milestones.filter(m => m.status === 'done').length}/{milestones.length} <span className="font-medium text-sm text-muted-foreground">done</span></p>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tasks</p>
              <p className="font-bold text-foreground text-[13px]">{doneTasks}/{totalTasks} <span className="font-medium text-sm text-muted-foreground">done</span></p>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Open Bugs</p>
              <p className="font-bold text-foreground text-[13px]">{openBugs}</p>
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Resolved Bugs</p>
              <p className="font-bold text-foreground text-[13px]">{resolvedBugs}</p>
            </div>
          </div>
        </Card>

        <div className="mt-2">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
            <div className="flex items-center gap-6 px-2">
              <button 
                onClick={() => setActiveTab('milestones')}
                className={`text-[15px] font-bold pb-2 border-b-2 mb-[-9px] transition-colors ${activeTab === 'milestones' ? 'text-foreground border-[#c24141]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
              >
                Milestones
              </button>
              <button 
                onClick={() => setActiveTab('bugs')}
                className={`text-[15px] font-bold pb-2 border-b-2 mb-[-9px] transition-colors ${activeTab === 'bugs' ? 'text-foreground border-[#c24141]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
              >
                Bug Tracker
              </button>
            </div>
            <div>
              {activeTab === 'milestones' ? (
                <Button size="sm" onClick={() => { setMilestoneToEdit(null); setAddMilestoneOpen(true); }} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white shadow-sm h-8 px-4 font-semibold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Milestone
                </Button>
              ) : (
                <Button size="sm" onClick={() => { setBugToEdit(null); setReportBugOpen(true); }} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white shadow-sm h-8 px-4 font-semibold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Report Bug
                </Button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'milestones' && (
            <div className="flex flex-col gap-4">
              {isMilestoneLoading ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : milestones.length === 0 ? (
                 <div className="bg-muted/20 rounded-xl p-8 text-center text-muted-foreground border-2 border-dashed">No milestones created yet.</div>
              ) : milestones.map((ms, idx) => (
                <Card key={ms._id} className="bg-card border-none rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ms.status === 'done' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {ms.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <span className="text-sm font-bold text-[#c24141]">{idx+1}</span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-[15px] mb-0.5">{ms.title}</h4>
                        <p className="text-xs text-muted-foreground">Due: {new Date(ms.dueDate).toLocaleDateString()} • {ms.tasks?.length || 0} tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ms.status === 'done' && <span className="text-[11px] font-bold px-3 py-1 rounded bg-green-100 text-green-600 dark:bg-green-900/30">Done</span>}
                      {ms.status === 'in_progress' && <span className="text-[11px] font-bold px-3 py-1 rounded bg-red-100 text-[#c24141] dark:bg-red-900/30">In Progress</span>}
                      {ms.status === 'pending' && <span className="text-[11px] font-bold px-3 py-1 rounded bg-slate-100 text-slate-500 dark:bg-slate-800">Pending</span>}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs font-semibold px-2 hover:bg-muted text-muted-foreground"
                        onClick={() => {
                          setMilestoneToEdit({id: ms._id, title: ms.title, dueDate: ms.dueDate, status: ms.status});
                          setAddMilestoneOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs font-semibold px-2 hover:bg-muted text-muted-foreground"
                        onClick={() => {
                          setSelectedMilestone({id: ms._id, title: ms.title});
                          setAddTaskOpen(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Task
                      </Button>
                    </div>
                  </div>
                  {ms.tasks && ms.tasks.length > 0 && (
                    <div className="border-t border-border/30 bg-[#f4f6fb]/50 dark:bg-muted/10">
                      {ms.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-center justify-between py-3 px-16 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div 
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleTaskStatusChange(ms._id, task._id, task.status === 'Done' ? 'Pending' : 'Done')}
                            >
                              {task.status === 'Done' ? (
                                <div className="w-[18px] h-[18px] rounded text-white bg-green-500 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded border-2 border-muted-foreground/30 bg-transparent" />
                              )}
                            </div>
                            <span className={`text-[13px] font-medium ${task.status === 'Done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</span>
                          </div>
                          <div className="flex items-center gap-8">
                            
                            {task.dueDate && <span className="text-xs text-muted-foreground font-medium w-32">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                            <div className="w-24 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger className={`flex items-center justify-between w-full text-[10px] font-bold px-2 py-1 rounded cursor-pointer border-none focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-muted
                                  ${task.status === 'Done' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : ''}
                                  ${task.status === 'In Progress' ? 'bg-red-100 text-[#c24141] dark:bg-red-900/30' : ''}
                                  ${task.status === 'Pending' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : ''}
                                `}>
                                  {task.status} <ChevronDown className="w-3 h-3 ml-1" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 bg-card rounded-xl">
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleTaskStatusChange(ms._id, task._id, 'Pending')}>Pending</DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleTaskStatusChange(ms._id, task._id, 'In Progress')}>In Progress</DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleTaskStatusChange(ms._id, task._id, 'Done')}>Done</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'bugs' && (
            <Card className="bg-card border-none rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-transparent">
                  <TableRow className="border-b border-muted/30 hover:bg-transparent">
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Title</TableHead>
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Severity</TableHead>
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Reported</TableHead>
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider">Resolution</TableHead>
                    <TableHead className="font-semibold py-4 px-6 text-muted-foreground text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isBugsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                  ) : bugs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No bugs reported.</TableCell></TableRow>
                  ) : bugs?.map((bug) => (
                    <TableRow key={bug._id} className="border-b border-muted/20 hover:bg-muted/10 transition-colors">
                      <TableCell className="px-6 py-4 text-[13px] font-medium text-foreground">{bug.title}</TableCell>
                      <TableCell className="px-6 py-4">
                        {bug.severity === 'Critical' && <span className="text-[12px] font-bold text-[#c24141]">{bug.severity}</span>}
                        {bug.severity === 'High' && <span className="text-[12px] font-bold text-orange-500">{bug.severity}</span>}
                        {(bug.severity === 'Low' || bug.severity === 'Medium') && <span className="text-[12px] font-bold text-blue-500">{bug.severity}</span>}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {bug.status === 'Open' && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-red-200 text-red-500 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">{bug.status}</span>}
                        {bug.status === 'In Progress' && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-orange-200 text-orange-500 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20">{bug.status}</span>}
                        {bug.status === 'Resolved' && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-200 text-green-600 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20">{bug.status}</span>}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[13px] text-muted-foreground">{new Date(bug.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="px-6 py-4 text-[13px] text-muted-foreground max-w-[200px] truncate">{bug.resolution || '—'}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => {
                            setBugToEdit(bug);
                            setReportBugOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      {projectId && (
        <>
          <AddMilestoneModal projectId={projectId} open={addMilestoneOpen} onOpenChange={(o) => {setAddMilestoneOpen(o); if(!o) setMilestoneToEdit(null)}} milestoneToEdit={milestoneToEdit} />
          <ReportBugModal projectId={projectId} open={reportBugOpen} onOpenChange={(o) => {setReportBugOpen(o); if(!o) setBugToEdit(null)}} bugToEdit={bugToEdit} />
          <AddTaskModal 
            projectId={projectId}
            milestoneId={selectedMilestone?.id || ''}
            open={addTaskOpen} 
            onOpenChange={setAddTaskOpen} 
            milestoneName={selectedMilestone?.title} 
          />
        </>
      )}
    </DashboardLayout>
  )
}

