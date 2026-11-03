"use client";

import React,  { useState, useEffect, useRef, Suspense } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Type,
  Heading1,
  List,
  Video,
  X,
  Loader2,
  Save,
  Trash2,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import {
  useGetWebsiteContentQuery,
  useAddProductMutation,
  useUpdateProductMutation,
} from "@/store/services/websiteContentSlice";
import { useUploadImageMutation } from "@/store/services/postSlice";
import { BASE_URL } from "@/store/constants";
import toast from "react-hot-toast";

interface Block {
  id: string;
  type: "paragraph" | "h2" | "bullet-list" | "youtube" | "image";
  content: string;
  items?: string[];
  data?: any;
}

function ProductFormPageContent() {
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const { data: content, isLoading: isContentLoading } = useGetWebsiteContentQuery({ tab: 'products', websiteId: selectedWebsiteId });
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();

  const isSaving = isAdding || isUpdating;

  // Standard metadata state
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    mediaType: "image",
    type: "product",
    customFields: {},
  });

  // Block editor state
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "paragraph", content: "" },
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>("1");

  // Logo file states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom key-value properties states
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  // Refs for auto-resize textareas
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Initialize page on load / fetch
  useEffect(() => {
    if (content && productId) {
      const product = content?.data?.products?.find((p: any) => p._id === productId);
      if (product) {
        let parsedCustomFields = product.customFields || {};
        if (typeof product.customFields === 'string') {
          try {
            parsedCustomFields = JSON.parse(product.customFields);
          } catch (e) {
            console.error("Failed to parse customFields:", e);
            parsedCustomFields = {};
          }
        }

        setFormData({
          title: product.title || "",
          description: product.description || "",
          mediaType: product.mediaType || "image",
          type: product.type || "product",
          customFields: parsedCustomFields,
        });
        if (parsedCustomFields?.blocks && Array.isArray(parsedCustomFields.blocks)) {
          setBlocks(parsedCustomFields.blocks);
        } else {
          setBlocks([{ id: "1", type: "paragraph", content: "" }]);
        }
      }
    }
  }, [content, productId]);

  // Block Content Handlers
  const handleBlockChange = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    const el = blockRefs.current[id];
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const handleListItemChange = (blockId: string, itemIndex: number, newValue: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          const newItems = [...(b.items || [])];
          newItems[itemIndex] = newValue;
          return { ...b, items: newItems };
        }
        return b;
      })
    );
    const el = blockRefs.current[`${blockId}-${itemIndex}`];
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const addBlock = (type: Block["type"], index: number) => {
    const newBlockId = Math.random().toString(36).substring(7);
    const newBlock: Block = {
      id: newBlockId,
      type,
      content: "",
      items: type === "bullet-list" ? [""] : undefined,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setActiveBlockId(newBlockId);
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) {
      setBlocks([{ id: "1", type: "paragraph", content: "" }]);
      return;
    }
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const changeBlockType = (index: number, type: Block["type"]) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index] };
    newBlocks[index].type = type;
    if (type === "bullet-list") {
      newBlocks[index].items = [newBlocks[index].content || ""];
      newBlocks[index].content = "";
    }
    setBlocks(newBlocks);
  };

  // Custom Fields properties handlers
  const handleAddCustomField = () => {
    if (!newKey.trim()) return;
    const key = newKey.trim();
    setFormData((prev: any) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [key]: newValue,
      },
    }));
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData((prev: any) => {
      const updated = { ...(prev.customFields || {}) };
      delete updated[key];
      return {
        ...prev,
        customFields: updated,
      };
    });
  };

  // YouTube Video Helper
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Save Product profile
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Product Title is required");
      return;
    }

    try {
      const submitData = new FormData();
      if (selectedWebsiteId) submitData.append('websiteId', selectedWebsiteId);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("mediaType", formData.mediaType);
      submitData.append("type", formData.type);
      
      const finalCustomFields = { ...(formData.customFields || {}) };
      if (newKey.trim()) {
        finalCustomFields[newKey.trim()] = newValue;
      }

      submitData.append(
        "customFields",
        JSON.stringify({
          ...finalCustomFields,
          blocks: blocks,
        })
      );

      if (selectedFile && formData.mediaType === "image") {
        submitData.append("websiteImage", selectedFile);
      } else if (selectedFile && formData.mediaType === "video") {
        submitData.append("websiteVideo", selectedFile);
      }

      if (productId) {
        await updateProduct({ id: productId, data: submitData }).unwrap();
        toast.success("Product profile updated successfully.");
      } else {
        await addProduct(submitData).unwrap();
        toast.success("New product logged successfully.");
      }
      router.push("/ui-manager");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product details.");
    }
  };

  if (isContentLoading) {
    return (
      <DashboardLayout>
        <div className="p-12 flex flex-col justify-center items-center text-muted-foreground min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#c23b22]" />
          <p className="text-sm font-medium">Hydrating content editor...</p>
        </div>
      </DashboardLayout>
    );
  }

  const existingProduct = content?.data?.products?.find((p: any) => p._id === productId);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans pb-32">
        
        {/* Navigation / Actions Bar */}
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 px-4 h-16 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {productId ? "Update Product" : "New Product Builder"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="text-xs text-muted-foreground">Products Section</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => router.push("/ui-manager")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium px-5 shadow-sm shadow-red-600/10 rounded-xl"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              {isSaving ? "Saving..." : "Commit Record"}
            </Button>
          </div>
        </div>

        {/* Content Layout Split */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Blocks Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
                <Sparkles className="w-5 h-5 text-[#c23b22]" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Dynamic Content Blocks</h2>
              </div>

              {/* Title Input field */}
              <div className="mb-8">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. CRM Smart System"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-2xl md:text-3xl font-extrabold tracking-tight bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-[#c23b22] focus:outline-none pb-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700/60"
                />
              </div>

              {/* Core Block Editor */}
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="relative group flex items-start gap-3"
                    onFocus={() => setActiveBlockId(block.id)}
                  >
                    {/* Add block dropdown trigger */}
                    {(activeBlockId === block.id || block.content === "") && (
                      <div className="absolute -left-10 top-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700">
                              <Plus className="w-4 h-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-lg border-slate-100 dark:border-slate-800 p-1.5">
                            <DropdownMenuItem onClick={() => changeBlockType(index, "paragraph")} className="rounded-lg gap-2 text-xs py-1.5 cursor-pointer">
                              <Type className="w-3.5 h-3.5 text-slate-400" /> Paragraph
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeBlockType(index, "h2")} className="rounded-lg gap-2 text-xs py-1.5 cursor-pointer">
                              <Heading1 className="w-3.5 h-3.5 text-slate-400" /> Subheading
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeBlockType(index, "bullet-list")} className="rounded-lg gap-2 text-xs py-1.5 cursor-pointer">
                              <List className="w-3.5 h-3.5 text-slate-400" /> Bullet List
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeBlockType(index, "youtube")} className="rounded-lg gap-2 text-xs py-1.5 cursor-pointer">
                              <Video className="w-3.5 h-3.5 text-red-500" /> YouTube Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addBlock("paragraph", index)} className="rounded-lg gap-2 text-xs py-1.5 border-t border-slate-50 dark:border-slate-850 mt-1 cursor-pointer">
                              <Plus className="w-3.5 h-3.5 text-slate-400" /> Add New Block
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* Block Workspace */}
                    <div className="flex-1 w-full min-w-0">
                      
                      {block.type === "paragraph" && (
                        <textarea
                          ref={(el) => { blockRefs.current[block.id] = el; }}
                          value={block.content}
                          onChange={(e) => handleBlockChange(block.id, e.target.value)}
                          placeholder="Type paragraph content..."
                          className="w-full resize-none bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none p-0 text-sm md:text-base leading-relaxed overflow-hidden"
                          rows={1}
                        />
                      )}

                      {block.type === "h2" && (
                        <textarea
                          ref={(el) => { blockRefs.current[block.id] = el; }}
                          value={block.content}
                          onChange={(e) => handleBlockChange(block.id, e.target.value)}
                          placeholder="Subheading Section"
                          className="w-full resize-none bg-transparent border-none text-slate-900 dark:text-slate-100 font-bold focus:outline-none p-0 text-lg md:text-xl overflow-hidden"
                          rows={1}
                        />
                      )}

                      {block.type === "bullet-list" && (
                        <ul className="list-disc pl-5 space-y-1 w-full text-slate-700 dark:text-slate-300">
                          {(block.items || [""]).map((item, itemIndex) => (
                            <li key={itemIndex} className="py-0.5 text-sm">
                              <textarea
                                ref={(el) => { blockRefs.current[`${block.id}-${itemIndex}`] = el; }}
                                value={item}
                                onChange={(e) => handleListItemChange(block.id, itemIndex, e.target.value)}
                                placeholder="List item content..."
                                className="w-full resize-none bg-transparent border-none focus:outline-none p-0 text-sm overflow-hidden"
                                rows={1}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextItems = [...(block.items || [])];
                                    nextItems.splice(itemIndex + 1, 0, "");
                                    setBlocks(blocks.map((b) => b.id === block.id ? { ...b, items: nextItems } : b));
                                  } else if (e.key === "Backspace" && item === "" && (block.items || []).length > 1) {
                                    e.preventDefault();
                                    const nextItems = (block.items || []).filter((_, idx) => idx !== itemIndex);
                                    setBlocks(blocks.map((b) => b.id === block.id ? { ...b, items: nextItems } : b));
                                  }
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      )}

                      {block.type === "youtube" && (
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                          {block.data?.url ? (
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
                              <iframe
                                src={`https://www.youtube.com/embed/${block.data.url}`}
                                className="w-full h-full border-0"
                                allowFullScreen
                                title="YouTube block video"
                              />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Paste YouTube link (e.g., https://youtu.be/...)"
                                className="text-xs rounded-lg h-9 bg-white dark:bg-black"
                                onChange={(e) => {
                                  const url = e.target.value.trim();
                                  const ytId = extractYoutubeId(url);
                                  if (ytId) {
                                    setBlocks(
                                      blocks.map((b) =>
                                        b.id === block.id ? { ...b, data: { url: ytId } } : b
                                      )
                                    );
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="border border-dashed rounded-xl p-4 flex flex-col items-center bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
                          {block.data?.url ? (
                            <>
                              <img
                                src={`${BASE_URL}${block.data.url}`}
                                alt=""
                                className="max-h-48 rounded-lg object-contain"
                              />
                              <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 rounded-full w-6 h-6"
                                onClick={() => {
                                  setBlocks(
                                    blocks.map((b) =>
                                      b.id === block.id ? { ...b, data: undefined } : b
                                    )
                                  );
                                }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <input
                                type="file"
                                id={`img-block-${block.id}`}
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const fd = new FormData();
                                  fd.append("thumbnail", file);
                                  try {
                                    const res = await uploadImage(fd).unwrap();
                                    setBlocks(
                                      blocks.map((b) =>
                                        b.id === block.id ? { ...b, data: { url: res.data.url } } : b
                                      )
                                    );
                                  } catch (err) {
                                    toast.error("Failed to upload image block asset.");
                                  }
                                }}
                              />
                              <label
                                htmlFor={`img-block-${block.id}`}
                                className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5"
                              >
                                Select Image File
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Block operations */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full shrink-0"
                        onClick={() => removeBlock(block.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Block at Bottom Helper */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 border-dashed"
                  onClick={() => addBlock("paragraph", blocks.length - 1)}
                >
                  <Plus className="w-3.5 h-3.5" /> Append Content Block
                </Button>
              </div>
            </div>
          </div>

          {/* Right Properties Panel Column */}
          <div className="space-y-6">
            
            {/* Media Upload Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Featured Media</label>
                <select
                  className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-2 py-1"
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div className="space-y-3">
                {selectedFile || (existingProduct && existingProduct.mediaUrl) ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex justify-center items-center h-28">
                    {formData.mediaType === "image" ? (
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : existingProduct.mediaUrl.startsWith("http")
                            ? existingProduct.mediaUrl
                            : `${BASE_URL}${existingProduct.mediaUrl}`
                        }
                        alt="Product media"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Video className="w-8 h-8 text-slate-400" />
                    )}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 rounded-lg text-white hover:bg-red-650 transition-colors"
                      title="Clear media"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer flex flex-col items-center gap-2"
                  >
                    {formData.mediaType === "image" ? <ImageIcon className="w-8 h-8 text-slate-300" /> : <Video className="w-8 h-8 text-slate-300" />}
                    <span className="text-xs font-medium">Select {formData.mediaType} file</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept={formData.mediaType === "image" ? "image/*" : "video/*"}
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-3.5 h-3.5 mr-1.5" /> Attach Media File
                </Button>
              </div>
            </div>

            {/* Standard Profile Fields Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-850 pb-2">Product Details</h3>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Product Type</label>
                  <select
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c23b22]"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="app">App</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Short Description</label>
                  <textarea
                    placeholder="Brief description of the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[70px] w-full rounded-xl border dark:border-slate-800 px-3 py-2 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-[#c23b22]"
                  />
                </div>
              </div>
            </div>

            {/* Custom key-value properties card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-850 pb-2">Additional Properties</h3>
              
              {/* Existing custom properties */}
              {Object.keys(formData.customFields || {}).filter(k => k !== "blocks").length > 0 && (
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  {Object.entries(formData.customFields || {})
                    .filter(([k]) => k !== "blocks")
                    .map(([key, val]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border shadow-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="font-bold text-[#c23b22] dark:text-[#e0523b] truncate max-w-[80px] bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded shrink-0">{key}</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">{val}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(key)}
                          className="text-slate-400 hover:text-red-500 shrink-0 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Add key-value controls */}
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Key (e.g. category)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="h-8 rounded-lg text-xs"
                  />
                  <Input
                    placeholder="Value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="h-8 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomField();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-8 rounded-lg text-xs"
                  onClick={handleAddCustomField}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Property
                </Button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default function ProductFormPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="p-12 flex flex-col justify-center items-center text-muted-foreground min-h-[50vh] gap-3"><Loader2 className="w-8 h-8 animate-spin text-[#c23b22]" /><p className="text-sm font-medium">Loading form...</p></div></DashboardLayout>}>
      <ProductFormPageContent />
    </Suspense>
  );
}
