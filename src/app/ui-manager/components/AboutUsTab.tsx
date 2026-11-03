"use client";

import React,  { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Pencil,
  Trash2,
  Plus,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useDeleteAboutUsMutation,
  useToggleAboutUsMutation,
} from "@/store/services/websiteContentSlice";
import { BASE_URL } from "@/store/constants";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from "next/navigation";

export default function AboutUsTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const router = useRouter();
  const { data: websiteContent, isLoading } = useGetWebsiteContentQuery({ tab: 'aboutUs', websiteId: selectedWebsiteId });
  const [deleteAboutUs, { isLoading: isDeleting }] = useDeleteAboutUsMutation();
  const [toggleAboutUs] = useToggleAboutUsMutation();

  const aboutUsItems = websiteContent?.data?.aboutUs || [];
  const activeCount = aboutUsItems.filter((p: any) => p.isLive).length;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [aboutToDelete, setAboutToDelete] = useState<string | null>(null);

  const handleOpenAdd = () => {
    router.push("/ui-manager/about/form");
  };

  const handleOpenEdit = (about: any) => {
    router.push(`/ui-manager/about/form?id=${about._id}`);
  };

  const triggerDelete = (id: string) => {
    setAboutToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!aboutToDelete) return;
    try {
      await deleteAboutUs({ id: aboutToDelete, websiteId: selectedWebsiteId }).unwrap();
      toast.success("About Us record removed from repository.");
      setIsDeleteModalOpen(false);
      setAboutToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Error removing item.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleAboutUs({ id: id, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Visibility altered.");
    } catch (err) {
      console.error(err);
      toast.error("Toggle unsuccessful.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading About Us data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {/* <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="w-4 h-4" />
        {activeCount} About Us items active — they will rotate at a regular interval on the website.
      </div> */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {aboutUsItems.length} items total - {activeCount} active
        </p>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add About Us Profile
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aboutUsItems.map((item: any) => (
          <Card key={item._id} className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex flex-col">
            <div className="h-36 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-center relative group overflow-hidden">
              {item.mediaUrl ? (
                <img
                  src={item.mediaUrl.startsWith("http") ? item.mediaUrl : `${BASE_URL}${item.mediaUrl}`}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                 <Package className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {item.isLive && (
                  <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 shadow-none px-2 py-0.5 font-semibold text-[10px]">Live</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{item.title}</h3>
                  <Switch
                    checked={item.isLive}
                    onCheckedChange={() => handleToggle(item._id)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(item)}
                  className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700 font-medium"
                >
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => triggerDelete(item._id)}
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
