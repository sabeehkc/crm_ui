"use client";

import React,   { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useDeleteNewsMutation,
  useTogglePublishNewsMutation,
} from "@/store/services/websiteContentSlice";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/store/constants";

export default function NewsTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const router = useRouter();
  const { data: websiteContent, isLoading } = useGetWebsiteContentQuery({ tab: 'news', websiteId: selectedWebsiteId });
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();
  const [togglePublish] = useTogglePublishNewsMutation();

  const news = websiteContent?.data?.news || [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  const handleOpenAdd = () => {
    router.push("/ui-manager/news/form");
  };

  const handleOpenEdit = (article: any) => {
    router.push(`/ui-manager/news/form?id=${article._id}`);
  };

  const triggerDelete = (id: string) => {
    setArticleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      await deleteNews({ id: articleToDelete, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Content successfully expunged.");
      setIsDeleteModalOpen(false);
      setArticleToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Action failed to resolve.");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await togglePublish({ id: id, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Publish status modified.");
    } catch (err) {
      console.error(err);
      toast.error("Toggle operation faulted.");
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Press Release': return 'text-red-600 bg-red-50 border-red-100';
      case 'Case Study': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Announcement': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" /> Fetching news stack...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <p className="text-sm text-slate-500 font-medium">{news.length} editorial items tracked.</p>
         <Button onClick={handleOpenAdd} className="bg-[#c23b22] hover:bg-[#a6321d] text-white rounded-xl gap-1">
           <Plus className="w-4 h-4" /> New Article
         </Button>
      </div>

      <div className="space-y-4">
        {news.map((article: any) => (
          <Card key={article._id} className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getTypeColor(article.type)} shadow-none border font-bold text-[10px] py-0 px-2 rounded`}>{article.type}</Badge>
                    <span className="text-xs text-slate-400 font-medium">{article.date ? new Date(article.date).toLocaleDateString() : "No date"}</span>
                    {article.isDraft && <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 bg-transparent">Draft</Badge>}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{article.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{article.subtitle}</p>
                  
                  {article.customFields?.blocks && Array.isArray(article.customFields.blocks) && article.customFields.blocks.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-[#c23b22] dark:text-[#e0523b] font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{article.customFields.blocks.length} content blocks configured</span>
                    </div>
                  )}

                  <div className="flex items-center gap-5 mt-3 text-slate-400 text-xs">
                     <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views || 0}</span>
                     <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> {article.likes || 0}</span>
                  </div>
                </div>
                {article.featuredImageUrl && (
                  <div className="hidden md:block shrink-0 h-20 w-32 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 ml-4 mr-2">
                    <img 
                      src={article.featuredImageUrl.startsWith("http") ? article.featuredImageUrl : `${BASE_URL}${article.featuredImageUrl}`} 
                      className="w-full h-full object-cover" 
                      alt="Cover" 
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 shrink-0 sm:pl-4 sm:border-l dark:border-slate-800">
                   <div className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 mr-1">
                     <span>Live</span>
                     <Switch checked={article.isPublished} onCheckedChange={() => handleToggleStatus(article._id)} />
                   </div>
                   <Button variant="outline" onClick={() => handleOpenEdit(article)} className="h-8 text-xs rounded-lg gap-1 border-slate-200">
                     <Pencil className="w-3" /> Edit
                   </Button>
                   <Button variant="ghost" onClick={() => triggerDelete(article._id)} className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {news.length === 0 && <div className="text-center text-slate-500 py-10 border-2 border-dashed rounded-2xl">Empty newsroom. Publish your first story.</div>}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Editorial"
        description="This will permanently expunge the article definition. Proceed?"
      />
    </div>
  );
}
