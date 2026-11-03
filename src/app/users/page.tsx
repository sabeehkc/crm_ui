'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, Search, Pencil, Eye, Pause, Play, Users, CheckSquare, Shield, LayoutDashboard, 
  Users2, Folder, CreditCard, Receipt, Settings, Check, ClipboardList, Loader2, 
  FileText,
  Mail,
  MessageCircle,
  Palette,
  LogOut
} from 'lucide-react'
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useToggleUserStatusMutation, 
  useUpdateUserMutation,
  useForceLogoutUserMutation
} from '@/store/services/userSlice'
import { useListProjectsQuery } from '@/store/services/projectSlice'
import { UserRole } from '@/types/user'
import toast from 'react-hot-toast'

const availablePages = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'enquiries', name: 'Enquiries', icon: Users2 },
  { id: 'chat', name: 'Chat', icon: MessageCircle },
  { id: 'projects', name: 'Projects', icon: Folder },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'expenses', name: 'Expenses', icon: Receipt },
  { id: 'ui', name: 'UI Manager', icon: Palette },
  { id: 'forms', name: 'Forms', icon: ClipboardList},
  { id: 'users', name: 'Users', icon: Users},
  { id: 'content', name: 'Content', icon: FileText},
  { id: 'newsletters', name: 'Newsletters', icon: Mail},
  { id: 'companySettings', name: 'Company Settings', icon: Settings},
];

const roleColorMap: Record<UserRole, string> = {
  admin: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10',
  staff: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10',
};

const defaultPermissions = {
  projects: { view: true, create: false, edit: false, delete: false },
  enquiries: { view: true, create: false, edit: false, delete: false },
  quotations: { view: true, create: false, edit: false, delete: false },
  invoices: { view: true, create: false, edit: false, delete: false },
  expenses: { view: true, create: false, edit: false, delete: false },
  forms: { view: true, create: false, edit: false, delete: false },
  tasks: { view: true, create: false, edit: false, delete: false },
};

const permissionModules = [
  'projects',
  'enquiries',
  'quotations',
  'invoices',
  'expenses',
  'forms',
  'tasks',
] as const;

const permissionActions = ['view', 'create', 'edit', 'delete'] as const;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // API Queries
  const { data: usersRes, isLoading: isUsersLoading } = useGetUsersQuery({ page, limit, search: searchQuery })
  const { data: projectsRes } = useListProjectsQuery({ limit: 100 })
  
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [toggleStatus] = useToggleUserStatusMutation()
  const [forceLogoutUser] = useForceLogoutUserMutation()

  // Form State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any>(defaultPermissions);
  const [errorMessage, setErrorMessage] = useState('');
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const usersList = usersRes?.data?.items || []
  const pagination = usersRes?.data
  const totalCount = usersRes?.data?.total || 0
  const activeCount = usersList.filter(u => u.isActive).length
  const inactiveCount = totalCount > usersList.length ? '—' : totalCount - activeCount; 

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('staff');
    setSelectedPages([]);
    setSelectedProjects([]);
    setPermissions(defaultPermissions);
    setEditingUser(null);
  };

  const handleTogglePage = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setNewName(user.name || '');
    setNewEmail(user.email || '');
    setNewPassword(''); // Keep blank for security
    setNewRole((user.role as UserRole) || 'staff');
    setSelectedPages(user.pages || []);
    setSelectedProjects(user.projects || []);
    setPermissions(user.permissions || defaultPermissions);
    setIsAddModalOpen(true);
  };

  const handleSubmitUser = async () => {
    if (!newName || !newEmail) return;
    
    const payload: any = {
      name: newName,
      email: newEmail,
      role: newRole,
      pages: selectedPages,
      projects: selectedProjects,
      permissions: newRole === 'staff' ? permissions : undefined
    };
    
    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      if (editingUser) {
        await updateUser({ id: editingUser._id, body: payload }).unwrap();
      } else {
        if (!newPassword) return; // Require password for new only
        await createUser({ ...payload, isActive: true }).unwrap();
      }
      resetForm();
      setIsAddModalOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to save user';
      console.error('Failed to save user', err);
      setErrorMessage(msg);
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      await toggleStatus(id).unwrap()
      toast.success("User status toggled successfully")
    } catch (err) {
      console.error('Failed status toggle', err)
    }
  };

  const handleForceLogout = async (id: string) => {
    try {
      await forceLogoutUser(id).unwrap()
      toast.success("Force Logout successfull")
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed force logout', err)
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full mx-auto pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage user access to pages and projects</p>
          </div>
          <div>
            <Dialog 
              open={isAddModalOpen} 
              onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button 
                  onClick={() => { resetForm(); setErrorMessage(''); }} 
                  className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 border-0 shadow-xl overflow-hidden rounded-xl dark:bg-slate-900">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                </DialogHeader>
                {errorMessage && (
                  <div className="px-6 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div className="p-6 space-y-6 bg-white dark:bg-slate-900 h-[65vh] overflow-y-auto">
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <Input 
                        placeholder="John Doe" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                      <Input 
                        type="email"
                        placeholder="john@crm.com" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password {editingUser && <span className="text-xs font-normal opacity-50">(leave blank to keep current)</span>}</label>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                      <select 
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 text-slate-800 dark:text-slate-200"
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Page Access */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">PAGE ACCESS</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availablePages.map(page => {
                        const isSelected = selectedPages.includes(page.id);
                        const Icon = page.icon;
                        return (
                          <div 
                            key={page.id}
                            onClick={() => handleTogglePage(page.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-red-500 border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`} />
                            <span className={`text-sm font-medium ${isSelected ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{page.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Project Access */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                      PROJECT ACCESS <span className="text-slate-400 dark:text-slate-500 font-normal normal-case">(leave empty = all projects)</span>
                    </label>
                    <div className="space-y-2">
                      {projectsRes?.data?.items?.map((proj: any) => {
                        const isSelected = selectedProjects.includes(proj._id);
                        return (
                          <div 
                            key={proj._id}
                            onClick={() => handleToggleProject(proj._id)}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-red-500 border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[#5b61f4] text-white font-bold text-xs">{proj.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{proj.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{proj.client}</p>
                              </div>
                            </div>
                            <Badge className="shadow-none border-0 bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5">{proj.status}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Fine-Grained Permissions (Staff only) */}
                  {newRole === 'staff' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        STAFF ACTION PERMISSIONS
                      </label>
                      <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                        <Table>
                          <TableHeader className="bg-slate-100/50 dark:bg-slate-800/40">
                            <TableRow className="border-slate-200 dark:border-slate-800">
                              <TableHead className="text-xs font-semibold py-2">Module</TableHead>
                              <TableHead className="text-xs font-semibold py-2 text-center">View</TableHead>
                              <TableHead className="text-xs font-semibold py-2 text-center">Create</TableHead>
                              <TableHead className="text-xs font-semibold py-2 text-center">Edit</TableHead>
                              <TableHead className="text-xs font-semibold py-2 text-center">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
  {permissionModules.map((resource: any) => (
    <TableRow
      key={resource}
      className="border-slate-200 dark:border-slate-800/50 hover:bg-transparent"
    >
      <TableCell className="py-2.5 font-medium text-sm text-slate-700 dark:text-slate-300 capitalize">
        {resource === 'invoices' ? 'invoices / billing' : resource}
      </TableCell>

      {permissionActions.map((action) => {
        const isChecked = permissions[resource]?.[action] ?? false;

        return (
          <TableCell
            key={action}
            className="py-2.5 text-center"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                setPermissions((prev: any) => ({
                  ...prev,
                  [resource]: {
                    ...prev[resource],
                    [action]: !isChecked,
                  },
                }));
              }}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#c23b22] focus:ring-[#c23b22] accent-[#c23b22]"
            />
          </TableCell>
        );
      })}
    </TableRow>
  ))}
</TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                </div>
                <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="border-slate-200 dark:border-slate-700 dark:text-slate-300 font-medium">Cancel</Button>
                  <Button 
                    disabled={isCreating || isUpdating}
                    className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium" 
                    onClick={handleSubmitUser}
                  >
                    {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">{totalCount}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">{activeCount}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Pause className="w-5 h-5 text-slate-500 dark:text-slate-400 fill-slate-500 dark:fill-slate-400" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">{inactiveCount}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">Inactive</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">{new Set(usersList.map(u => u.role)).size}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">Roles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 shadow-sm" 
            placeholder="Search users by name, email or role..." 
          />
        </div>

        {/* Table */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800">
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 pl-6">User</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">Role</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">Accessible Pages</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">Assigned Projects</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">Joined</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4">Status</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-medium py-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow>
                     <TableCell colSpan={7} className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin inline text-red-600" />
                     </TableCell>
                  </TableRow>
                ) : usersList.length > 0 ? usersList.map((user: any) => (
                  <TableRow key={user._id} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group">
                    
                    {/* User Info */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-[#5b61f4] text-white font-bold text-xs">{getInitials(user.name || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user.name || 'Unknown User'}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Role */}
                    <TableCell className="py-4">
                      <Badge className={`${roleColorMap[user.role as UserRole] || roleColorMap.staff} shadow-none border-0 font-semibold px-2.5 py-0.5 capitalize`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    
                    {/* Accessible Pages */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(!user.pages || user.pages.length === 0) ? (
                          <Badge className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-none border-0 font-semibold px-2 py-0.5">All Pages</Badge>
                        ) : (
                          user.pages.map((pageId: string, idx: number) => {
                            const pageMeta = availablePages.find(p => p.id === pageId);
                            const Icon = pageMeta?.icon || LayoutDashboard;
                            return (
                              <Badge key={idx} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-none border-0 font-medium px-2 py-0.5 flex items-center gap-1">
                                <Icon className="w-3 h-3" />
                                {pageMeta?.name || pageId}
                              </Badge>
                            )
                          })
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Assigned Projects */}
                    <TableCell className="py-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                      {(!user.projects || user.projects.length === 0) ? (
                        <Badge className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-none border-0 font-semibold px-2 py-0.5">All Projects</Badge>
                      ) : (
                        <span className="font-medium text-slate-700 dark:text-slate-300">{user.projects.length} Projects</span>
                      )}
                    </TableCell>
                    
                    {/* Joined */}
                    <TableCell className="py-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 transition-opacity">
                        <Button 
                          onClick={() => openEditModal(user)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.isActive ? (
                          <Button title="Deactivate" variant="ghost" size="icon" onClick={() => handleToggleUserStatus(user._id)} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg">
                            <Pause className="w-4 h-4 fill-current" />
                          </Button>
                        ) : (
                          <Button title="Activate" variant="ghost" size="icon" onClick={() => handleToggleUserStatus(user._id)} className="h-8 w-8 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 rounded-lg">
                            <Play className="w-4 h-4 fill-current" />
                          </Button>
                        )}
                        <Button title="Force Logout" variant="ghost" size="icon" onClick={() => handleForceLogout(user._id)} className="h-8 w-8 text-orange-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 rounded-lg">
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-700 dark:text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * limit, pagination.total)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{pagination.total}</span> entries
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
                  {[...Array(pagination.totalPages)].map((_, i) => (
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
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  )
}
