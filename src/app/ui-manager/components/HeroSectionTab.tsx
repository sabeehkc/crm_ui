"use client";

import React,  { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Pencil,
  Trash2,
  Globe,
  Plus,
  Loader2,
  Video,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useUpdateHeroMutation,
} from "@/store/services/websiteContentSlice";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export default function HeroSectionTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const router = useRouter();
  const { data: websiteContent, isLoading } = useGetWebsiteContentQuery({ tab: 'hero', websiteId: selectedWebsiteId });
  const [updateHero, { isLoading: isUpdating }] = useUpdateHeroMutation();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
  
  const currentSlides = websiteContent?.data?.hero?.slides || [];
  
  const [slides, setSlides] = useState<any[]>([]);
  useEffect(() => {
    if (currentSlides) {
      setSlides(currentSlides);
    }
  }, [currentSlides]);

  const handleOpenAdd = () => {
    router.push("/ui-manager/hero/form");
  };

  const handleOpenEdit = (idx: number) => {
    router.push(`/ui-manager/hero/form?index=${idx}`);
  };

  const triggerDelete = (idx: number) => {
    setIndexToDelete(idx);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSlide = async () => {
    if (indexToDelete === null) return;
    const newSlides = slides.filter((_, i) => i !== indexToDelete);
    try {
      const formData = new FormData();
      if (selectedWebsiteId) formData.append('websiteId', selectedWebsiteId);
      formData.append("slides", JSON.stringify(newSlides));
      await updateHero(formData).unwrap();
      toast.success("Hero slide deleted successfully.");
      setIsDeleteModalOpen(false);
      setIndexToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Deletion failed to propagate.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading hero section...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {slides.length} active slides configured.
          </p>
          <Button
            onClick={handleOpenAdd}
            className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Slide
          </Button>
        </div>

        <div className="space-y-3">
          {slides.map((slide: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="cursor-move text-slate-300 dark:text-slate-600">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                {slide.type === "video" ? (
                   <Video className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                ) : (
                   <Globe className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-base">
                  {slide.title || "Untitled Slide"}
                </h4>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 truncate max-w-md">
                  URL: {slide.mediaUrl || "No media linked"}
                </p>
                {slide.customFields && Object.keys(slide.customFields).filter(k => k !== "blocks").length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(slide.customFields)
                      .filter(([k]) => k !== "blocks")
                      .map(([k, v]: [string, any]) => (
                        <span key={k} className="inline-flex items-center gap-1 text-[10px] bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={`${k}: ${v}`}>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{k}:</span>
                          <span className="truncate">{v}</span>
                        </span>
                      ))}
                  </div>
                )}
                {slide.customFields?.blocks && Array.isArray(slide.customFields.blocks) && slide.customFields.blocks.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#c23b22] dark:text-[#e0523b] font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>{slide.customFields.blocks.length} content blocks configured</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block px-2 py-0.5 border rounded border-slate-200">
                  {slide.type}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(index)}
                  className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => triggerDelete(index)}
                  disabled={isUpdating}
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
             <div className="p-12 border-2 border-dashed rounded-2xl text-center text-slate-500">
                No slides created yet. Add one to get started.
             </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSlide}
        isLoading={isUpdating}
        title="Remove Hero Slide"
        description="Warning: This instantaneously clears this slide asset from the live application header loop. Proceed?"
      />
    </div>
  );
}

// Mini inline icon component for Sparkles if not imported
function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}
