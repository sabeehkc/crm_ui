"use client";

import React,  { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Plus,
  Paperclip,
  Loader2,
  Toolbox,
  ExternalLink,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useAddToolMutation,
  useUpdateToolMutation,
  useDeleteToolMutation,
} from "@/store/services/websiteContentSlice";
import { BASE_URL } from "@/store/constants";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ToolsTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const { data: websiteContent, isLoading } = useGetWebsiteContentQuery({ tab: 'tools', websiteId: selectedWebsiteId });
  const [addTool, { isLoading: isAdding }] = useAddToolMutation();
  const [updateTool, { isLoading: isUpdating }] = useUpdateToolMutation();
  const [deleteTool, { isLoading: isDeleting }] = useDeleteToolMutation();

  const tools = websiteContent?.data?.tools || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    link: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({ name: "", link: "", description: "" });
    setSelectedFile(null);
    setEditingTool(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: any) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name || "",
      link: tool.link || "",
      description: tool.description || "",
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("link", formData.link);
      submitData.append("description", formData.description);
      if (selectedFile) {
        submitData.append("websiteImage", selectedFile);
      }

      if (editingTool) {
        await updateTool({ id: editingTool._id, data: submitData }).unwrap();
        toast.success("Tool details refined.");
      } else {
        await addTool(submitData).unwrap();
        toast.success("Tool listed successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Process failed.");
    }
  };

  const triggerDelete = (id: string) => {
    setToolToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    try {
      await deleteTool({ id: toolToDelete, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Tool successfully removed.");
      setIsDeleteModalOpen(false);
      setToolToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Removal sequence aborted.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mb-2" /> Cataloging software toolkit...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <p className="text-xs text-muted-foreground">{tools.length} internal/external utility definitions found.</p>
         <Button onClick={handleOpenAdd} className="bg-[#c23b22] hover:bg-[#a6321d] text-white rounded-xl font-semibold">
           <Plus className="w-4 h-4 mr-1" /> Add Tool
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool: any) => (
          <Card key={tool._id} className="overflow-hidden border shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl.startsWith("http") ? tool.logoUrl : `${BASE_URL}${tool.logoUrl}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Toolbox className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{tool.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">{tool.description || "No info"}</p>
                    <a href={tool.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1.5">
                       <ExternalLink className="w-2.5 h-2.5" /> Visit site
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(tool)} className="h-7 w-7 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 rounded-lg">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => triggerDelete(tool._id)} className="h-7 w-7 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
             <DialogTitle className="font-bold text-lg">{editingTool ? "Edit Reference" : "Define Tool"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div className="space-y-1.5">
               <label className="text-sm font-semibold">Name</label>
               <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Example: JIRA" className="rounded-xl" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-semibold">Actionable Web Link</label>
               <Input value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="https://example.com" className="rounded-xl" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-semibold">Short Descriptor</label>
               <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe what users accomplish with it..." className="w-full min-h-[60px] rounded-xl border p-3 text-sm" />
             </div>
             <div className="pt-2">
               <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
               <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/30 text-muted-foreground">
                  <Paperclip className="w-4 h-4 inline mr-2" />
                  <span className="text-sm font-medium">{selectedFile ? selectedFile.name : "Reference Logo (Optional)"}</span>
               </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">Dismiss</Button>
             <Button onClick={handleSubmit} disabled={isAdding || isUpdating} className="bg-primary rounded-xl font-semibold">
               {(isAdding || isUpdating) ? <Loader2 className="animate-spin w-4 h-4" /> : "Commit"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Tool Reference"
        description="Are you certain you want to expunge this tool from the library index?"
      />
    </div>
  );
}
