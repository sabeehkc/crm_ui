"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  Loader2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useToggleFaqMutation,
} from "@/store/services/websiteContentSlice";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function FAQTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const { data: websiteContent, isLoading } = useGetWebsiteContentQuery({ tab: 'faq', websiteId: selectedWebsiteId });
  const [addFaq, { isLoading: isAdding }] = useAddFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const [toggleFaq] = useToggleFaqMutation();

  const faqs = websiteContent?.data?.faq || [];

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const sortedFaqs = [...faqs].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const totalPages = Math.ceil(sortedFaqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = sortedFaqs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    displayOrder: 0,
    isLive: true,
  });

  const resetForm = () => {
    setFormData({ question: "", answer: "", displayOrder: 0, isLive: true });
    setEditingFaq(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: any) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      displayOrder: faq.displayOrder || 0,
      isLive: faq.isLive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        question: formData.question,
        answer: formData.answer,
        displayOrder: Number(formData.displayOrder),
        isLive: formData.isLive,
      };

      if (editingFaq) {
        await updateFaq({ id: editingFaq._id, data: { ...submitData, websiteId: selectedWebsiteId } }).unwrap();
        toast.success("FAQ updated successfully.");
      } else {
        await addFaq({ ...submitData, websiteId: selectedWebsiteId }).unwrap();
        toast.success("FAQ added successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Process failed.");
    }
  };

  const triggerDelete = (id: string) => {
    setFaqToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    try {
      await deleteFaq({ id: faqToDelete, websiteId: selectedWebsiteId }).unwrap();
      toast.success("FAQ successfully removed.");
      setIsDeleteModalOpen(false);
      setFaqToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Removal sequence aborted.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleFaq({ id: id, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Visibility toggled.");
    } catch (err) {
      console.error(err);
      toast.error("Toggle failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mb-2" /> Loading FAQs...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <p className="text-xs text-muted-foreground">{faqs.length} FAQ entries found.</p>
         <Button onClick={handleOpenAdd} className="bg-[#c23b22] hover:bg-[#a6321d] text-white rounded-xl font-semibold">
           <Plus className="w-4 h-4 mr-1" /> Add FAQ
         </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedFaqs.map((faq: any) => (
          <Card key={faq._id} className="overflow-hidden border shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                    <HelpCircle className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{faq.question}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 whitespace-pre-wrap">{faq.answer}</p>
                    <div className="mt-2 text-xs font-medium text-slate-400">Order: {faq.displayOrder || 0}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500">{faq.isLive ? 'Live' : 'Hidden'}</span>
                    <Switch
                      checked={faq.isLive}
                      onCheckedChange={() => handleToggle(faq._id)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(faq)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => triggerDelete(faq._id)} className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-2xl">
            No FAQs added yet.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-slate-900 px-4 py-3 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, faqs.length)}</span> of <span className="font-medium">{faqs.length}</span> results
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 rounded-lg ${currentPage === i + 1 ? 'bg-[#c23b22] hover:bg-[#a6321d] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
             <DialogTitle className="font-bold text-lg">{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div className="space-y-1.5">
               <label className="text-sm font-semibold">Question</label>
               <Input value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} placeholder="e.g., What are your opening hours?" className="rounded-xl" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-semibold">Answer</label>
               <textarea value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} placeholder="Provide a detailed answer..." className="w-full min-h-[100px] rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 dark:bg-slate-950 dark:border-slate-800" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold">Display Order</label>
                 <Input type="number" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} className="rounded-xl" />
               </div>
               <div className="space-y-1.5 flex flex-col justify-end pb-2">
                 <div className="flex items-center gap-2">
                   <Switch
                     checked={formData.isLive}
                     onCheckedChange={(checked) => setFormData({...formData, isLive: checked})}
                   />
                   <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Set as Live</label>
                 </div>
               </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
             <Button onClick={handleSubmit} disabled={isAdding || isUpdating || !formData.question.trim() || !formData.answer.trim()} className="bg-primary rounded-xl font-semibold">
               {(isAdding || isUpdating) ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
               {editingFaq ? "Save Changes" : "Add FAQ"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
}
