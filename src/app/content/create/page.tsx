"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  Image as ImageIcon,
  MoreHorizontal,
  Settings,
  Plus,
  Type,
  Heading1,
  Quote,
  List,
  ListOrdered,
  Code,
  Minus,
  Video,
  MessageSquareWarning,
  HelpCircle,
  X,
  UploadCloud,
  GripVertical,
  AlignLeft,
  Calendar,
  Tag,
  Loader2,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
  useGetPostDetailsQuery,
  useUploadImageMutation,
} from "@/store/services/postSlice";
import { BASE_URL } from "@/store/constants";
import { PostCategory, PostStatus } from "@/types/post";

type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "quote"
  | "bullet-list"
  | "numbered-list"
  | "code"
  | "image"
  | "divider"
  | "youtube"
  | "callout"
  | "qa";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  items?: string[];
  data?: any;
}

function CreateBlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [uploadImage] = useUploadImageMutation();

  const { data: postDetails, isLoading: isDetailsLoading } =
    useGetPostDetailsQuery(postId || "", { skip: !postId });

  const isPublishing = isCreating || isUpdating;

  // States
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "paragraph", content: "" },
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>("1");

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Unsaved"
  >("Saved");

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);

  // SEO & Publish Details
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<PostCategory>("Blog");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // Content blocks references for auto-resize
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate slug from title automatically if not edited manually
    if (title && !slug.includes("-manual")) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  }, [title]);

  useEffect(() => {
    // Auto-save simulation
    const timer = setTimeout(() => {
      if (saveStatus === "Unsaved") {
        setSaveStatus("Saving...");
        setTimeout(() => setSaveStatus("Saved"), 800);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, subtitle, blocks, saveStatus]);

  useEffect(() => {
    if (postDetails?.data) {
      const p = postDetails.data;
      setTitle(p.title || "");
      setSubtitle(p.summary || "");
      setCoverImage(p.thumbnail || null);
      setSlug(p.slug || "");
      setCategory(p.category || "Blog");
      setTags(p.metaTags || []);
      if (p.content && Array.isArray(p.content) && p.content.length > 0) {
        const parsedContent = p.content.map((block: any) => {
          let parsedData = block.data;
          if (typeof block.data === "string") {
            try {
              parsedData = JSON.parse(block.data);
            } catch (e) {
              console.error("Failed to parse block data", e);
            }
          }
          return { ...block, data: parsedData };
        });
        const clonedContent = JSON.parse(JSON.stringify(parsedContent));
        setBlocks(clonedContent);
        if (clonedContent.length > 0) {
          setActiveBlockId(clonedContent[0].id);
        }
      }
      if (p.publishDate) {
        setScheduleDate(new Date(p.publishDate).toISOString().slice(0, 16));
      }
    }
  }, [postDetails]);

  const handleBlockChange = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    setSaveStatus("Unsaved");

    // Auto resize textarea
    const el = blockRefs.current[id];
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const handleListItemChange = (
    blockId: string,
    itemIndex: number,
    newValue: string,
  ) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          const newItems = [...(b.items || [])];
          newItems[itemIndex] = newValue;
          return { ...b, items: newItems };
        }
        return b;
      }),
    );
    setSaveStatus("Unsaved");

    // Auto resize
    const el = blockRefs.current[`${blockId}-${itemIndex}`];
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const handleListItemKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    blockIndex: number,
    itemIndex: number,
    blockId: string,
  ) => {
    const block = blocks[blockIndex];
    const items = block.items || [];

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // If pressing Enter on an empty item, exit list or remove empty item
      if (items[itemIndex].trim() === "") {
        if (itemIndex === items.length - 1) {
          const updatedItems = items.slice(0, -1);
          let newBlocks = [...blocks];

          if (updatedItems.length === 0) {
            newBlocks[blockIndex] = {
              id: blockId,
              type: "paragraph",
              content: "",
            };
            setBlocks(newBlocks);
            setTimeout(() => blockRefs.current[blockId]?.focus(), 10);
          } else {
            newBlocks[blockIndex] = { ...block, items: updatedItems };
            const newParagraphId = Math.random().toString(36).substring(7);
            newBlocks.splice(blockIndex + 1, 0, {
              id: newParagraphId,
              type: "paragraph",
              content: "",
            });
            setBlocks(newBlocks);
            setActiveBlockId(newParagraphId);
            setTimeout(() => blockRefs.current[newParagraphId]?.focus(), 10);
          }
        } else {
          const newItems = [...items];
          newItems.splice(itemIndex + 1, 0, "");
          const newBlocks = blocks.map((b) =>
            b.id === blockId ? { ...b, items: newItems } : b,
          );
          setBlocks(newBlocks);
          setTimeout(() => {
            blockRefs.current[`${blockId}-${itemIndex + 1}`]?.focus();
          }, 10);
        }
        return;
      }

      const newItems = [...items];
      newItems.splice(itemIndex + 1, 0, "");
      const newBlocks = blocks.map((b) =>
        b.id === blockId ? { ...b, items: newItems } : b,
      );
      setBlocks(newBlocks);
      setTimeout(() => {
        blockRefs.current[`${blockId}-${itemIndex + 1}`]?.focus();
      }, 10);
    } else if (e.key === "Backspace") {
      const cursorPosition = e.currentTarget.selectionStart;

      if (cursorPosition === 0) {
        e.preventDefault();

        if (items[itemIndex] === "") {
          const newItems = items.filter(
            (_: any, idx: number) => idx !== itemIndex,
          );

          if (newItems.length === 0) {
            const newBlocks = [...blocks];
            newBlocks[blockIndex] = {
              id: blockId,
              type: "paragraph",
              content: "",
            };
            setBlocks(newBlocks);
            setTimeout(() => blockRefs.current[blockId]?.focus(), 10);
          } else {
            const newBlocks = blocks.map((b) =>
              b.id === blockId ? { ...b, items: newItems } : b,
            );
            setBlocks(newBlocks);
            const focusIndex = itemIndex > 0 ? itemIndex - 1 : 0;
            setTimeout(() => {
              blockRefs.current[`${blockId}-${focusIndex}`]?.focus();
            }, 10);
          }
        } else if (itemIndex > 0) {
          const prevItemText = items[itemIndex - 1];
          const currentText = items[itemIndex];
          const newItems = [...items];
          newItems[itemIndex - 1] = prevItemText + currentText;
          newItems.splice(itemIndex, 1);

          const newBlocks = blocks.map((b) =>
            b.id === blockId ? { ...b, items: newItems } : b,
          );
          setBlocks(newBlocks);
          setTimeout(() => {
            const prevInput = blockRefs.current[`${blockId}-${itemIndex - 1}`];
            if (prevInput) {
              prevInput.focus();
              prevInput.setSelectionRange(
                prevItemText.length,
                prevItemText.length,
              );
            }
          }, 10);
        }
      }
    } else if (e.key === "ArrowUp" && itemIndex > 0) {
      e.preventDefault();
      blockRefs.current[`${blockId}-${itemIndex - 1}`]?.focus();
    } else if (e.key === "ArrowDown" && itemIndex < items.length - 1) {
      e.preventDefault();
      blockRefs.current[`${blockId}-${itemIndex + 1}`]?.focus();
    }
  };

  const handleBlockKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    id: string,
  ) => {
    const currentBlock = blocks[index];

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const newBlockId = Math.random().toString(36).substring(7);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, {
        id: newBlockId,
        type: "paragraph",
        content: "",
      });
      setBlocks(newBlocks);
      setActiveBlockId(newBlockId);
      setTimeout(() => {
        blockRefs.current[newBlockId]?.focus();
      }, 10);
    } else if (e.key === "Backspace" && currentBlock.content === "") {
      e.preventDefault();

      if (
        currentBlock.type !== "paragraph" &&
        currentBlock.type !== "image" &&
        currentBlock.type !== "youtube" &&
        currentBlock.type !== "divider"
      ) {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], type: "paragraph" };
        setBlocks(newBlocks);
        return;
      }

      if (blocks.length > 1) {
        const newBlocks = blocks.filter((b) => b.id !== id);
        setBlocks(newBlocks);
        const prevId = index > 0 ? blocks[index - 1].id : blocks[0].id;
        setActiveBlockId(prevId);
        setTimeout(() => {
          blockRefs.current[prevId]?.focus();
        }, 10);
      }
    }
  };

  const changeBlockType = (index: number, type: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], type };
    if (type === "divider") {
      newBlocks[index].content = "---";
    } else if (type === "bullet-list" || type === "numbered-list") {
      newBlocks[index].items = [newBlocks[index].content || ""];
      newBlocks[index].content = "";
    } else if (type === "qa") {
      newBlocks[index].data = { faqs: [{ q: newBlocks[index].content || "", a: "" }] };
      newBlocks[index].content = "";
    }
    setBlocks(newBlocks);
    setTimeout(() => {
      if (type === "bullet-list" || type === "numbered-list") {
        blockRefs.current[`${newBlocks[index].id}-0`]?.focus();
      } else {
        blockRefs.current[newBlocks[index].id]?.focus();
      }
    }, 10);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
      setSaveStatus("Unsaved");
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const getWordCount = () => {
    const text =
      blocks.map((b) => b.content).join(" ") + " " + title + " " + subtitle;
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  };

  const wordCount = getWordCount();
  const readTime = Math.ceil(wordCount / 200) || 1;

  const BlockMenu = ({ index }: { index: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all absolute -left-12 top-0 md:-left-16"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 p-2"
      >
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider mb-1">
          Add Content
        </p>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "paragraph")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Type className="w-4 h-4 text-slate-500" /> Paragraph
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "h2")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Heading1 className="w-4 h-4 text-slate-500" /> Heading
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "quote")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Quote className="w-4 h-4 text-slate-500" /> Quote
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "bullet-list")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <List className="w-4 h-4 text-slate-500" /> Bullet List
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "numbered-list")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <ListOrdered className="w-4 h-4 text-slate-500" /> Numbered List
        </DropdownMenuItem>
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider mb-1">
          Media & Embeds
        </p>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "image")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-slate-500" /> Image
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "youtube")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Video className="w-4 h-4 text-red-500" /> YouTube Video
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "code")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Code className="w-4 h-4 text-slate-500" /> Code Block
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "callout")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <MessageSquareWarning className="w-4 h-4 text-indigo-500" /> Callout
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "qa")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-emerald-500" /> Q&A Section
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeBlockType(index, "divider")}
          className="rounded-lg gap-3 py-2 cursor-pointer"
        >
          <Minus className="w-4 h-4 text-slate-500" /> Divider
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans pb-32">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 px-4 h-16 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">Draft</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              {saveStatus === "Saving..." && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {saveStatus === "Saved" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {saveStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex rounded-full text-muted-foreground hover:text-foreground font-medium"
            onClick={() => setIsSeoModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" /> SEO Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex rounded-full text-muted-foreground hover:text-foreground font-medium"
          >
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium px-4"
            disabled={isPublishing}
            onClick={async () => {
              if (!title.trim()) {
                toast.error("A title is required to save.");
                return;
              }
              try {
                const dataToSave = {
                  title,
                  slug,
                  summary: subtitle,
                  thumbnail: coverImage || undefined,
                  content: blocks,
                  category,
                  status: "Draft" as PostStatus,
                  metaTags: tags,
                };
                if (postId) {
                  await updatePost({ id: postId, data: dataToSave }).unwrap();
                  toast.success("Draft updated successfully!");
                } else {
                  await createPost(dataToSave).unwrap();
                  toast.success("Draft saved successfully!");
                }
                setTimeout(() => router.push("/content"), 1000);
              } catch (err: any) {
                toast.error(err?.data?.message || "Failed to save draft");
              }
            }}
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Save
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 shadow-sm shadow-emerald-600/20"
            onClick={() => setIsPublishModalOpen(true)}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Main Content */}
      <main className="max-w-3xl mx-auto px-6 pt-12 sm:pt-20 transition-all">
        {/* Cover Image Upload */}
        <div className="mb-10 group relative">
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const fd = new FormData();
                fd.append("thumbnail", file);
                try {
                  const res = await uploadImage(fd).unwrap();
                  setCoverImage(res.data.url);
                  setSaveStatus("Unsaved");
                } catch (err) {
                  toast.error("Cover image upload failed");
                }
              }
            }}
          />
          {coverImage ? (
            <div className="relative w-full aspect-video md:aspect-21/9 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <img
                src={`${BASE_URL}${coverImage}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  className="rounded-full font-medium"
                  onClick={() => coverInputRef.current?.click()}
                >
                  Change Cover
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full font-medium"
                  onClick={() => setCoverImage(null)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="w-full p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer min-h-[160px]"
              onClick={() => coverInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                <ImagePlus className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Add a cover image
              </p>
              <p className="text-sm mt-1">Drag & drop or click to upload</p>
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-4 mb-10">
          <Textarea
            placeholder="Title"
            className="w-full resize-none bg-transparent border-none text-4xl md:text-5xl font-extrabold tracking-tight focus-visible:ring-0 p-0 text-slate-900 dark:text-slate-50 placeholder:text-slate-300 dark:placeholder:text-slate-700/60 h-auto overflow-hidden leading-tight"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              setSaveStatus("Unsaved");
            }}
            rows={1}
          />
          <Textarea
            placeholder="Tell your story..."
            className="w-full resize-none bg-transparent border-none text-xl md:text-2xl font-normal text-slate-500 focus-visible:ring-0 p-0 placeholder:text-slate-300 dark:placeholder:text-slate-700/60 h-auto overflow-hidden leading-relaxed"
            value={subtitle}
            onChange={(e) => {
              setSubtitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              setSaveStatus("Unsaved");
            }}
            rows={1}
          />
        </div>

        {/* Block Editor */}
        <div className="space-y-2">
          {blocks.map((block, index) => {
            return (
              <div
                key={block.id}
                className={`relative group flex ${
                  block.type === "h2"
                    ? "mt-6 mb-2"
                    : block.type === "quote"
                      ? "my-4"
                      : block.type === "image" || block.type === "youtube"
                        ? "my-6"
                        : block.type === "divider"
                          ? "my-6"
                          : block.type === "code"
                            ? "my-4"
                            : block.type === "bullet-list" ||
                                block.type === "numbered-list"
                              ? "my-2"
                              : "mb-1"
                }`}
                onFocus={() => setActiveBlockId(block.id)}
              >
                {(activeBlockId === block.id || block.content === "") && (
                  <BlockMenu index={index} />
                )}

                <div className="flex-1 w-full min-w-0">
                  {/* Render different block types */}
                  {block.type === "paragraph" && (
                    <Textarea
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      value={block.content}
                      onChange={(e) =>
                        handleBlockChange(block.id, e.target.value)
                      }
                      onKeyDown={(e) => handleBlockKeyDown(e, index, block.id)}
                      placeholder={
                        index === 0
                          ? "Start writing..."
                          : "Press '/' for commands..."
                      }
                      className="w-full resize-none bg-transparent border-none text-lg leading-relaxed focus-visible:ring-0 p-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 overflow-hidden"
                      rows={1}
                    />
                  )}

                  {block.type === "h2" && (
                    <Textarea
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      value={block.content}
                      onChange={(e) =>
                        handleBlockChange(block.id, e.target.value)
                      }
                      onKeyDown={(e) => handleBlockKeyDown(e, index, block.id)}
                      placeholder="Heading"
                      className="w-full resize-none bg-transparent border-none text-2xl font-bold leading-snug focus-visible:ring-0 p-0 text-slate-900 dark:text-slate-50 overflow-hidden"
                      rows={1}
                    />
                  )}

                  {block.type === "quote" && (
                    <div className="border-l-4 border-slate-900 dark:border-slate-50 pl-6 py-1">
                      <Textarea
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                        }}
                        value={block.content}
                        onChange={(e) =>
                          handleBlockChange(block.id, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleBlockKeyDown(e, index, block.id)
                        }
                        placeholder="Enter quote..."
                        className="w-full resize-none bg-transparent border-none text-2xl font-serif italic leading-relaxed focus-visible:ring-0 p-0 text-slate-700 dark:text-slate-300 overflow-hidden"
                        rows={1}
                      />
                    </div>
                  )}

                  {block.type === "bullet-list" && (
                    <ul className="list-disc pl-6 space-y-1 text-slate-800 dark:text-slate-200 w-full">
                      {(block.items || [""]).map(
                        (item: string, itemIndex: number) => (
                          <li
                            key={itemIndex}
                            className="relative leading-normal py-0.5"
                          >
                            <Textarea
                              ref={(el) => {
                                blockRefs.current[`${block.id}-${itemIndex}`] =
                                  el;
                              }}
                              value={item}
                              onChange={(e) =>
                                handleListItemChange(
                                  block.id,
                                  itemIndex,
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) =>
                                handleListItemKeyDown(
                                  e,
                                  index,
                                  itemIndex,
                                  block.id,
                                )
                              }
                              placeholder="List item..."
                              className="w-full resize-none bg-transparent border-none text-lg leading-relaxed focus-visible:ring-0 p-0 text-slate-800 dark:text-slate-200 overflow-hidden"
                              rows={1}
                            />
                          </li>
                        ),
                      )}
                    </ul>
                  )}

                  {block.type === "numbered-list" && (
                    <ol className="list-decimal pl-6 space-y-1 text-slate-800 dark:text-slate-200 w-full">
                      {(block.items || [""]).map(
                        (item: string, itemIndex: number) => (
                          <li
                            key={itemIndex}
                            className="relative leading-normal py-0.5"
                          >
                            <Textarea
                              ref={(el) => {
                                blockRefs.current[`${block.id}-${itemIndex}`] =
                                  el;
                              }}
                              value={item}
                              onChange={(e) =>
                                handleListItemChange(
                                  block.id,
                                  itemIndex,
                                  e.target.value,
                                )
                              }
                              onKeyDown={(e) =>
                                handleListItemKeyDown(
                                  e,
                                  index,
                                  itemIndex,
                                  block.id,
                                )
                              }
                              placeholder="List item..."
                              className="w-full resize-none bg-transparent border-none text-lg leading-relaxed focus-visible:ring-0 p-0 text-slate-800 dark:text-slate-200 overflow-hidden"
                              rows={1}
                            />
                          </li>
                        ),
                      )}
                    </ol>
                  )}

                  {block.type === "code" && (
                    <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-xl p-4 font-mono text-sm shadow-sm my-4">
                      <Textarea
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                        }}
                        value={block.content}
                        onChange={(e) =>
                          handleBlockChange(block.id, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleBlockKeyDown(e, index, block.id)
                        }
                        placeholder="// Write some code..."
                        className="w-full resize-none bg-transparent border-none focus-visible:ring-0 p-0 overflow-hidden font-mono"
                        rows={1}
                      />
                    </div>
                  )}

                  {block.type === "callout" && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 rounded-xl p-5 flex gap-4 my-6 border border-indigo-100 dark:border-indigo-900/50">
                      <MessageSquareWarning className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                      <Textarea
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                        }}
                        value={block.content}
                        onChange={(e) =>
                          handleBlockChange(block.id, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleBlockKeyDown(e, index, block.id)
                        }
                        placeholder="Important note..."
                        className="w-full resize-none bg-transparent border-none text-lg focus-visible:ring-0 p-0 overflow-hidden placeholder:text-indigo-300 dark:placeholder:text-indigo-700"
                        rows={1}
                      />
                    </div>
                  )}

                  {block.type === "qa" && (() => {
                    const faqs = block.data?.faqs || (block.content ? [{ q: block.content, a: block.data?.answer || "" }] : [{ q: "", a: "" }]);
                    return (
                      <div className="pl-6 space-y-4 w-full my-4">
                        {faqs.map((faq: any, faqIndex: number) => (
                          <div key={faqIndex} className="relative group/faq space-y-1">
                            <div className="relative leading-normal py-0.5 flex items-start gap-2">
                              <span className="font-medium select-none min-w-6">{faqIndex + 1}.</span>
                              <Textarea
                                ref={(el) => {
                                  blockRefs.current[`${block.id}-q-${faqIndex}`] = el;
                                }}
                                value={faq.q}
                                onChange={(e) => {
                                  const newFaqs = [...faqs];
                                  newFaqs[faqIndex] = { ...newFaqs[faqIndex], q: e.target.value };
                                  const newBlocks = blocks.map((b) =>
                                    b.id === block.id ? { ...b, data: { ...b.data, faqs: newFaqs } } : b
                                  );
                                  setBlocks(newBlocks);
                                  setSaveStatus("Unsaved");
                                  e.target.style.height = "auto";
                                  e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                placeholder="Question..."
                                className="w-full resize-none bg-transparent border-none text-lg leading-relaxed focus-visible:ring-0 p-0 text-slate-800 dark:text-slate-200 overflow-hidden font-medium"
                                rows={1}
                              />
                            </div>
                            <div className="relative leading-normal py-0.5 flex items-start gap-2">
                              <span className="font-medium select-none min-w-6">A.</span>
                              <Textarea
                                ref={(el) => {
                                  blockRefs.current[`${block.id}-a-${faqIndex}`] = el;
                                }}
                                value={faq.a}
                                onChange={(e) => {
                                  const newFaqs = [...faqs];
                                  newFaqs[faqIndex] = { ...newFaqs[faqIndex], a: e.target.value };
                                  const newBlocks = blocks.map((b) =>
                                    b.id === block.id ? { ...b, data: { ...b.data, faqs: newFaqs } } : b
                                  );
                                  setBlocks(newBlocks);
                                  setSaveStatus("Unsaved");
                                  e.target.style.height = "auto";
                                  e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                placeholder="Answer..."
                                className="w-full resize-none bg-transparent border-none text-lg leading-relaxed focus-visible:ring-0 p-0 text-slate-800 dark:text-slate-200 overflow-hidden"
                                rows={1}
                              />
                            </div>
                            {faqs.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute -left-12 top-0 opacity-0 group-hover/faq:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-8 h-8 rounded-full"
                                onClick={() => {
                                  const newFaqs = faqs.filter((_: any, idx: number) => idx !== faqIndex);
                                  const newBlocks = blocks.map((b) =>
                                    b.id === block.id ? { ...b, data: { ...b.data, faqs: newFaqs } } : b
                                  );
                                  setBlocks(newBlocks);
                                  setSaveStatus("Unsaved");
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium"
                            onClick={() => {
                              const newFaqs = [...faqs, { q: "", a: "" }];
                              const newBlocks = blocks.map((b) =>
                                b.id === block.id ? { ...b, data: { ...b.data, faqs: newFaqs } } : b
                              );
                              setBlocks(newBlocks);
                              setSaveStatus("Unsaved");
                              setTimeout(() => {
                                blockRefs.current[`${block.id}-q-${newFaqs.length - 1}`]?.focus();
                              }, 10);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Question
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {block.type === "divider" && (
                    <div className="py-8 flex justify-center">
                      <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 relative min-h-[160px] overflow-hidden">
                      {block.data?.url ? (
                        <>
                          <img
                            src={`${BASE_URL}${block.data.url}`}
                            alt="Uploaded block"
                            className="max-w-full rounded-xl"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-4 right-4 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newBlocks = blocks.filter(
                                (b) => b.id !== block.id,
                              );
                              if (newBlocks.length === 0)
                                newBlocks.push({
                                  id: Math.random().toString(),
                                  type: "paragraph",
                                  content: "",
                                });
                              setBlocks(newBlocks);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            type="file"
                            id={`img-${block.id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append("thumbnail", file);
                              try {
                                const res = await uploadImage(fd).unwrap();
                                const newBlocks = blocks.map((b) =>
                                  b.id === block.id
                                    ? { ...b, data: { url: res.data.url } }
                                    : b,
                                );

                                // Add a paragraph block below it automatically
                                const bIndex = newBlocks.findIndex(
                                  (b) => b.id === block.id,
                                );
                                const nextId = Math.random()
                                  .toString(36)
                                  .substring(7);
                                newBlocks.splice(bIndex + 1, 0, {
                                  id: nextId,
                                  type: "paragraph",
                                  content: "",
                                });

                                setBlocks(newBlocks);
                                setActiveBlockId(nextId);
                                setTimeout(() => {
                                  blockRefs.current[nextId]?.focus();
                                }, 50);
                              } catch (err) {
                                toast.error("Failed to upload image");
                              }
                            }}
                          />
                          <label
                            htmlFor={`img-${block.id}`}
                            className="cursor-pointer flex flex-col items-center gap-3"
                          >
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                              <UploadCloud className="w-5 h-5 text-slate-500" />
                            </div>
                            <p className="font-medium text-slate-600 dark:text-slate-300">
                              Upload an image
                            </p>
                            <div className="rounded-full mt-2 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-4 py-1.5 text-sm font-medium">
                              Choose File
                            </div>
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  {block.type === "youtube" && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 group/yt relative overflow-hidden">
                      {block.data?.url ? (
                        <div className="space-y-4">
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-sm relative">
                            <iframe
                              src={`https://www.youtube.com/embed/${block.data.url}`}
                              className="w-full h-full border-none"
                              allowFullScreen
                              title="YouTube Video Preview"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-4 right-4 rounded-full w-8 h-8 opacity-0 group-hover/yt:opacity-100 transition-opacity"
                              onClick={() => {
                                const newBlocks = blocks.map((b) =>
                                  b.id === block.id
                                    ? { ...b, data: undefined }
                                    : b,
                                );
                                setBlocks(newBlocks);
                                setSaveStatus("Unsaved");
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                            <span>
                              YouTube Video ID:{" "}
                              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono">
                                {block.data.url}
                              </code>
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-red-500 hover:text-red-650 font-semibold"
                              onClick={() => {
                                const newBlocks = blocks.map((b) =>
                                  b.id === block.id
                                    ? { ...b, data: undefined }
                                    : b,
                                );
                                setBlocks(newBlocks);
                                setSaveStatus("Unsaved");
                              }}
                            >
                              Change Video
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
                              <Video className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-855 dark:text-slate-200">
                                Embed YouTube Video
                              </span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Embed standard or short YouTube video links
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste YouTube URL (e.g. https://youtu.be/...)"
                              className="bg-white dark:bg-black border-slate-200 dark:border-slate-800 rounded-xl h-11"
                              onChange={(e) => {
                                const url = e.target.value.trim();
                                if (!url) return;
                                const videoId = extractYoutubeId(url);
                                if (videoId) {
                                  const newBlocks = blocks.map((b) =>
                                    b.id === block.id
                                      ? { ...b, data: { url: videoId } }
                                      : b,
                                  );
                                  setBlocks(newBlocks);
                                  setSaveStatus("Unsaved");
                                  toast.success(
                                    "Successfully resolved YouTube video ID!",
                                  );
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clickable area at the bottom to add new text blocks easily */}
        <div
          className="h-32 w-full cursor-text"
          onClick={() => {
            if (blocks.length > 0) {
              const last = blocks[blocks.length - 1];
              if (last.type !== "paragraph" || last.content !== "") {
                const nextId = Math.random().toString(36).substring(7);
                setBlocks([
                  ...blocks,
                  { id: nextId, type: "paragraph", content: "" },
                ]);
                setActiveBlockId(nextId);
                setTimeout(() => {
                  blockRefs.current[nextId]?.focus();
                }, 50);
              } else {
                setActiveBlockId(last.id);
                blockRefs.current[last.id]?.focus();
              }
            }
          }}
        />

        {/* Footer info */}
        <div className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-muted-foreground pb-20">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{readTime} min read</span>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setIsPublishModalOpen(true)}
            >
              Ready to publish?
            </Button>
          </div>
        </div>
      </main>

      {/* SEO Settings Dialog */}
      <Dialog open={isSeoModalOpen} onOpenChange={setIsSeoModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Document Settings
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label>URL Slug</Label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 h-11 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all overflow-hidden">
                <span className="text-muted-foreground text-sm shrink-0">
                  yoursite.com/blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full font-medium ml-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <select
                className="w-full h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
              >
                <option value="Blog">Blog</option>
                <option value="News">News</option>
                <option value="Announcement">Announcement</option>
                <option value="Case Study">Case Study</option>
                <option value="Tips & Tricks">Tips & Tricks</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring transition-all min-h-[44px]">
                <div className="flex flex-wrap gap-2 mb-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-1 px-2.5 rounded-md text-xs font-medium gap-1 shadow-sm"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                      />
                    </Badge>
                  ))}
                </div>
                <input
                  placeholder="Press enter to add tags..."
                  className="bg-transparent border-none outline-none text-sm w-full p-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-base">Featured Post</Label>
                <p className="text-xs text-muted-foreground">
                  Highlight this post on the homepage.
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <Button
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
              onClick={() => setIsSeoModalOpen(false)}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Modal */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl">
          <div className="p-8 pb-6">
            <DialogHeader className="mb-8 text-left space-y-0">
              <DialogTitle className="text-2xl font-bold mb-2 text-left">
                Publishing details
              </DialogTitle>
              <p className="text-muted-foreground text-sm text-left">
                Review your post details before making it live to your audience.
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </p>
                <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  {coverImage ? (
                    <img
                      src={`${BASE_URL}${coverImage}`}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg line-clamp-2 leading-tight">
                    {title || "Untitled Post"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {subtitle ||
                      "No summary provided. It's recommended to add a short description."}
                  </p>
                </div>
              </div>

              <div className="md:col-span-3 space-y-6">
                <div className="space-y-3">
                  <Label>Publish Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      className="pl-10 rounded-xl h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to publish immediately.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Author Visibility</Label>
                  <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Admin User</p>
                      <p className="text-xs text-muted-foreground">
                        Content Team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              variant="ghost"
              className="rounded-full font-medium"
              onClick={() => setIsPublishModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-md shadow-emerald-600/20"
              disabled={isPublishing}
              onClick={async () => {
                if (!title.trim()) {
                  toast.error("A title is required to publish.");
                  return;
                }
                try {
                  const dataToSave = {
                    title,
                    slug,
                    summary: subtitle,
                    thumbnail: coverImage || undefined,
                    content: blocks,
                    category,
                    status: (scheduleDate
                      ? "Scheduled"
                      : "Published") as PostStatus,
                    publishDate: scheduleDate
                      ? new Date(scheduleDate).toISOString()
                      : undefined,
                    metaTags: tags,
                  };
                  if (postId) {
                    await updatePost({ id: postId, data: dataToSave }).unwrap();
                    toast.success("Post updated successfully!");
                  } else {
                    await createPost(dataToSave).unwrap();
                    toast.success("Post published successfully!");
                  }
                  setIsPublishModalOpen(false);
                  setTimeout(() => router.push("/content"), 1000);
                } catch (err: any) {
                  toast.error(err?.data?.message || "Failed to publish post");
                }
              }}
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {scheduleDate ? "Schedule Post" : "Publish Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CreateBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CreateBlogPageContent />
    </Suspense>
  );
}
