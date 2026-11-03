"use client";

import React,  { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Loader2, Building2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useDeleteClientMutation,
} from "@/store/services/websiteContentSlice";
import { BASE_URL } from "@/store/constants";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export default function ClientsTab() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const router = useRouter();
  const { data: content, isLoading } = useGetWebsiteContentQuery({ tab: 'clients', websiteId: selectedWebsiteId });
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  const clients = content?.data?.clients || [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const paginatedClients = clients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenAdd = () => {
    router.push("/ui-manager/client/form");
  };

  const handleOpenEdit = (client: any) => {
    router.push(`/ui-manager/client/form?id=${client._id}`);
  };

  const triggerDelete = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient({ id: clientToDelete, websiteId: selectedWebsiteId }).unwrap();
      toast.success("Client record wiped.");
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Error executing wipe.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Clients...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{clients.length} registered clients found.</p>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedClients.map((client: any) => (
          <Card key={client._id} className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {client.logoUrl ? (
                      <img
                        src={client.logoUrl.startsWith("http") ? client.logoUrl : `${BASE_URL}${client.logoUrl}`}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{client.name}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{client.contactPerson || "Contact undisclosed"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {client.isShown && (
                    <Badge className="bg-emerald-50 text-emerald-600 border-0 shadow-none font-semibold px-2 py-0.5 text-xs mr-1">
                      Shown
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(client)}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => triggerDelete(client._id)}
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {client.testimony && (
                <div className="relative pl-4 mt-2 border-l-[3px] border-[#c23b22]/80 dark:border-[#e0523b]/80">
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic leading-relaxed">
                    "{client.testimony}"
                  </p>
                </div>
              )}
              {client.customFields && Object.keys(client.customFields).filter(k => k !== "blocks").length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  {Object.entries(client.customFields)
                    .filter(([k]) => k !== "blocks")
                    .map(([k, v]: [string, any]) => (
                      <span key={k} className="inline-flex items-center gap-1 text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={`${k}: ${v}`}>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{k}:</span>
                        <span className="truncate">{v}</span>
                      </span>
                    ))}
                </div>
              )}
              {client.customFields?.blocks && Array.isArray(client.customFields.blocks) && client.customFields.blocks.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-[#c23b22] dark:text-[#e0523b] font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{client.customFields.blocks.length} content blocks configured</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-slate-900 px-4 py-3 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, clients.length)}</span> of <span className="font-medium">{clients.length}</span> results
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Expunge Client Info"
        description="Permanently remove this client reference and all associated public testimonials?"
      />
    </div>
  );
}
