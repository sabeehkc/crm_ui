'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProjectMutation, useUpdateProjectMutation } from '@/store/services/projectSlice'
import { useGetUsersQuery } from '@/store/services/userSlice'
import { Loader2, Check, X } from 'lucide-react'
import { useEffect } from 'react'

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: any | null;
}

export function NewProjectModal({ open, onOpenChange, projectToEdit }: NewProjectModalProps) {
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();


  const [formData, setFormData] = useState<{
    name: string;
    client: string;
    budget: string;
    startDate: string;
    dueDate: string;
    description: string;
    tags: string;
  }>({
    name: '',
    client: '',
    budget: '',
    startDate: '',
    dueDate: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        setFormData({
          name: projectToEdit.name,
          client: projectToEdit.client,
          budget: projectToEdit.budget.toString(),
          startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : '',
          dueDate: projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().split('T')[0] : '',
          description: projectToEdit.description || '',
          tags: projectToEdit.tags ? projectToEdit.tags.join(', ') : '',
        });
      } else {
        setFormData({ name: '', client: '', budget: '', startDate: '', dueDate: '', description: '', tags: '' });
      }
    }
  }, [open, projectToEdit]);

  const isLoading = isCreating || isUpdating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        name: formData.name,
        client: formData.client,
        budget: Number(formData.budget),
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (projectToEdit) {
        await updateProject({
          id: projectToEdit._id,
          data: dataToSubmit
        }).unwrap();
      } else {
        await createProject(dataToSubmit).unwrap();
      }
      
      // Clear state and close
      setFormData({ name: '', client: '', budget: '', startDate: '', dueDate: '', description: '', tags: '' });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{projectToEdit ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {projectToEdit ? 'Update the details of your project.' : 'Create a new project by filling out the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Project Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. E-Commerce Platform" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Client</label>
                <Input 
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                  placeholder="Client name" 
                  className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Budget (₹)</label>
                <Input 
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  placeholder="100000" 
                  type="number" 
                  className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <Input 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  type="date" 
                  className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <Input 
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  type="date" 
                  className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <Input 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Web, React (comma separated)" 
                className="bg-input border-transparent focus-visible:ring-1 h-11 rounded-lg" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Project overview..." 
                className="bg-input border-transparent focus-visible:ring-1 min-h-[80px] resize-none rounded-lg" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg bg-transparent hover:bg-muted/50 border-muted">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm px-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

