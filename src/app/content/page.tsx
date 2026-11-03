"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
  TrendingUp,
  Activity,
  ExternalLink,
  Calendar,
  Globe,
  PenSquare,
  Loader2,
  X,
} from "lucide-react";
import {
  useListPostsQuery,
  useGetPostStatsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useUpdatePostStatusMutation,
  useDeletePostMutation,
} from "@/store/services/postSlice";
import { IPost, PostCategory, PostStatus } from "@/types/post";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { BASE_URL } from "@/store/constants";

// Mock / Default avatar logic helper
const getInitials = (name: string) => {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";
};

// Predefined activities - static visual element as in mock
const recentActivities = [
  {
    id: 1,
    user: "Admin",
    action: "published",
    item: "Platform Launch",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Content Team",
    action: "created draft",
    item: "New Feature Overview",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: "SEO Expert",
    action: "updated tags",
    item: "Web Tech Insights",
    time: "Yesterday",
  },
];

export default function ContentManagementPage() {
  const router = useRouter();
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const statusMapping: Record<string, string> = {
    all: "",
    published: "Published",
    draft: "Draft",
    scheduled: "Scheduled",
  };

  // Queries
  const { data: postsRes, isLoading: isPostsLoading } = useListPostsQuery({
    page,
    limit: 10,
    search: searchTerm,
    status: statusMapping[activeTab],
  });

  const { data: statsRes } = useGetPostStatsQuery();

  // Mutations
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [updatePostStatus] = useUpdatePostStatusMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  // Form State & Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PostCategory>("Blog");
  const [summary, setSummary] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Quick Draft State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickSummary, setQuickSummary] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Lists
  const postsList = postsRes?.data?.items || [];
  const totalResults = postsRes?.data?.total || 0;
  const totalPages = postsRes?.data?.totalPages || 1;

  // Stats Display
  const stats = statsRes?.data || {
    total: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
    archived: 0,
  };

  // Sorted Posts for engaging widget
  const highlyEngaging = [...postsList]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // Event Handlers
  const handleOpenCreate = () => {
    router.push("/content/create");
  };

  const handleOpenEdit = (post: IPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setSummary(post.summary || "");
    setPublishDate(
      post.publishDate
        ? new Date(post.publishDate).toISOString().slice(0, 16)
        : "",
    );
    setThumbnail(post.thumbnail || "");
    setMetaTags(post.metaTags || []);
    setSelectedFile(null);
    setPreviewUrl(BASE_URL + post.thumbnail || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (overrideStatus?: PostStatus) => {
    if (!title.trim()) {
      toast.error("Please provide a title.");
      return;
    }

    const finalStatus =
      overrideStatus || (editingPost ? editingPost.status : "Draft");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("summary", summary.trim());
    if (publishDate) {
      formData.append("publishDate", new Date(publishDate).toISOString());
    }
    formData.append("status", finalStatus);

    metaTags.forEach((tag) => formData.append("metaTags", tag));

    if (selectedFile) {
      formData.append("thumbnail", selectedFile);
    } else if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      if (editingPost) {
        await updatePost({ id: editingPost._id, data: formData }).unwrap();
        toast.success("Post modified successfully!");
      } else {
        await createPost(formData).unwrap();
        toast.success("New post registered!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Could not commit post changes.");
    }
  };

  const handleQuickDraft = async () => {
    if (!quickTitle.trim()) {
      toast.error("Give your quick thought a title.");
      return;
    }
    try {
      await createPost({
        title: quickTitle,
        summary: quickSummary,
        category: "Blog",
        status: "Draft",
      }).unwrap();
      toast.success("Draft captured!");
      setQuickTitle("");
      setQuickSummary("");
    } catch (err) {
      console.error(err);
      toast.error("Draft execution failed.");
    }
  };

  const handleStatusUpdate = async (id: string, status: PostStatus) => {
    try {
      await updatePostStatus({ id, status }).unwrap();
      toast.success(`Post status set to ${status}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to alter post status.");
    }
  };

  const triggerDelete = (id: string) => {
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete).unwrap();
      toast.success("Post expunged permanently.");
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Deletion aborted due to a fault.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setThumbnail("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addMetaTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!metaTags.includes(tagInput.trim())) {
        setMetaTags([...metaTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeMetaTag = (tagToRemove: string) => {
    setMetaTags(metaTags.filter((t) => t !== tagToRemove));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published
          </Badge>
        );
      case "Draft":
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-600 border-slate-200 gap-1"
          >
            <PenSquare className="w-3 h-3" /> Draft
          </Badge>
        );
      case "Scheduled":
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
      case "Archived":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground border-muted gap-1"
          >
            <Archive className="w-3 h-3" /> Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Content Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your website copy, blog posts, news articles and campaigns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl gap-2 font-medium"
              onClick={() => window.open("http://localhost:3000", "_blank")}
            >
              <Globe className="w-4 h-4" /> View Site
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2 font-semibold px-5"
            >
              <Plus className="h-4 w-4" /> Create Content
            </Button>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 transition-colors flex items-center justify-center shrink-0 border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                  {stats.total || 0}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                  Total Posts
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                  {stats.published || 0}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                  Published
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                  {stats.scheduled || 0}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                  Scheduled
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center min-h-[80px]">
            <CardContent className="p-4 flex items-center gap-3 w-full pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                <PenSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-center gap-2 justify-end flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none m-0">
                  {stats.drafts || 0}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium m-0">
                  Drafts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content & Right Sidebar Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-2">
          {/* Table / Main Section */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800/60 border">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => {
                      setActiveTab(val);
                      setPage(1);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-muted/60 p-1 inline-flex rounded-xl">
                      <TabsTrigger
                        value="all"
                        className="rounded-lg data-[state=active]:bg-background px-4 text-xs font-medium"
                      >
                        All Posts
                      </TabsTrigger>
                      <TabsTrigger
                        value="published"
                        className="rounded-lg data-[state=active]:bg-background px-4 text-xs font-medium"
                      >
                        Published
                      </TabsTrigger>
                      <TabsTrigger
                        value="draft"
                        className="rounded-lg data-[state=active]:bg-background px-4 text-xs font-medium"
                      >
                        Drafts
                      </TabsTrigger>
                      <TabsTrigger
                        value="scheduled"
                        className="rounded-lg data-[state=active]:bg-background px-4 text-xs font-medium"
                      >
                        Scheduled
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center w-full sm:w-auto gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search titles..."
                        className="pl-9 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border-transparent focus:border-primary/30 focus:bg-white transition-all h-9"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-9 w-9"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[400px]">
                {isPostsLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm">
                      Retrieving database indices...
                    </p>
                  </div>
                ) : postsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FileText className="w-10 h-10 opacity-20" />
                    <p className="mt-2 text-sm">
                      No content posts found matching this view.
                    </p>
                  </div>
                ) : (
                  postsList.map((post) => (
                    <div
                      key={post._id}
                      className="pt-6 first:pt-0 pb-6 flex flex-col md:flex-row gap-6 items-start group justify-between"
                    >
                      {/* Left Content Side */}
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* Header metadata */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <Avatar className="w-5 h-5 border border-slate-200 dark:border-slate-700">
                            <AvatarImage
                              src={post.author?.profile?.avatar || ""}
                            />
                            <AvatarFallback className="text-[9px] font-bold">
                              {getInitials(post.author?.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {post.author?.name || "Unknown"}
                          </span>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium py-0 px-2 rounded-full border-slate-200 dark:border-slate-700"
                          >
                            {post.category}
                          </Badge>
                          <span>•</span>
                          <span>
                            {new Date(post.updatedAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1">
                          <h3
                            className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                            onClick={() =>
                              router.push(`/content/create?id=${post._id}`)
                            }
                          >
                            {post.title}
                          </h3>
                          <p
                            className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-serif leading-relaxed cursor-pointer"
                            onClick={() =>
                              router.push(`/content/create?id=${post._id}`)
                            }
                          >
                            {post.summary ||
                              "No description provided for this narrative. Click to open and enrich with details."}
                          </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {getStatusBadge(post.status)}
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />{" "}
                              {post.views.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs gap-1.5 font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                              onClick={() =>
                                router.push(`/content/preview?slug=${post.slug}`)
                              }
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs gap-1.5 font-medium border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                              onClick={() =>
                                router.push(`/content/create?id=${post._id}`)
                              }
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl"
                              >
                                <DropdownMenuLabel>
                                  Management
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {post.status === "Published" ? (
                                  <DropdownMenuItem
                                    className="gap-2 rounded-lg cursor-pointer"
                                    onClick={() =>
                                      handleStatusUpdate(post._id, "Draft")
                                    }
                                  >
                                    <Globe className="w-3.5 h-3.5" /> Unpublish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="gap-2 rounded-lg cursor-pointer"
                                    onClick={() =>
                                      handleStatusUpdate(post._id, "Published")
                                    }
                                  >
                                    <Globe className="w-3.5 h-3.5" /> Publish
                                    Now
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="gap-2 rounded-lg cursor-pointer"
                                  onClick={() =>
                                    handleStatusUpdate(post._id, "Archived")
                                  }
                                >
                                  <Archive className="w-3.5 h-3.5" /> Archive
                                  Post
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-red-600 focus:text-red-600 rounded-lg cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/30"
                                  onClick={() => triggerDelete(post._id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                  Permanent
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Right Cover Thumbnail */}
                      <div
                        className="w-full md:w-44 aspect-video md:aspect-4/3 rounded-2xl overflow-hidden bg-muted relative shadow-sm border shrink-0 group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center cursor-pointer"
                        onClick={() =>
                          router.push(`/content/create?id=${post._id}`)
                        }
                      >
                        {post.thumbnail ? (
                          <img
                            src={`${BASE_URL}${post.thumbnail}`}
                            alt={post.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min((page - 1) * 10 + 1, totalResults)} to{" "}
                  {Math.min(page * 10, totalResults)} of {totalResults} results
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column Sidebar */}
          <div className="space-y-6">
            {/* Quick Draft */}
            <Card className="border-none shadow-md rounded-2xl bg-linear-to-b from-white to-slate-50/50 dark:from-card dark:to-slate-900/50 overflow-hidden border border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenSquare className="w-4 h-4 text-primary" /> Quick Idea
                  Draft
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <Input
                  placeholder="Idea title..."
                  className="bg-background/50 rounded-lg text-sm"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Jot down notes..."
                  className="min-h-[80px] bg-background/50 text-sm rounded-xl"
                  value={quickSummary}
                  onChange={(e) => setQuickSummary(e.target.value)}
                />
                <Button
                  size="sm"
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white"
                  onClick={handleQuickDraft}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Thought
                </Button>
              </CardContent>
            </Card>

            {/* Most Viewed Widget */}
            <Card className="border-none shadow-md rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" /> Highly
                  Engaging
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                  {highlyEngaging.length > 0 ? (
                    highlyEngaging.map((post, idx) => (
                      <React.Fragment key={post._id}>
                        {idx > 0 && <Separator className="opacity-50" />}
                        <div
                          className="flex gap-3 items-start group cursor-pointer"
                          onClick={() => handleOpenEdit(post)}
                        >
                          <div className="text-xs font-bold text-muted-foreground pt-0.5">
                            0{idx + 1}
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                              {post.title}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              {post.views.toLocaleString()} views{" "}
                              <TrendingUp className="w-2 h-2" />
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2 text-center">
                      No active tracking metrics yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            {/* <Card className="border-none shadow-md rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-3 pt-5 px-5">
                   <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                   <div className="space-y-4">
                      {recentActivities.map(act => (
                        <div key={act.id} className="flex items-start gap-3 relative">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                           <div className="space-y-0.5">
                              <p className="text-xs font-medium text-foreground">
                                <span className="font-bold">{act.user}</span> {act.action} <span className="font-semibold text-slate-600 dark:text-slate-400">"{act.item}"</span>
                              </p>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {act.time}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card> */}
          </div>
        </div>
      </div>

      {/* Upsert dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="text-xl">
              {editingPost ? "Edit Corporate Narrative" : "Record New Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Post Title</Label>
                <Input
                  placeholder="Enter a catchy title..."
                  className="rounded-xl h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full h-11 bg-transparent border rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-slate-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PostCategory)}
                >
                  <option value="Blog">Blog</option>
                  <option value="News">News</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Tips & Tricks">Tips & Tricks</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Target Publish Date</Label>
                <Input
                  type="datetime-local"
                  className="rounded-xl h-11"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group min-h-[140px] relative"
              >
                {previewUrl ? (
                  <div className="w-full h-full max-h-[150px] flex justify-center items-center overflow-hidden rounded-lg relative">
                    <img
                      src={previewUrl}
                      className="object-contain w-full h-full max-h-[150px]"
                      alt="thumbnail preview"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearImage();
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary mb-2 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <span className="text-xs text-muted-foreground mt-1">
                      Recommended size: 1200x630px (PNG, JPG)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Summary / Excerpt</Label>
              <Textarea
                placeholder="Summarize content for SEO and previews..."
                className="rounded-xl min-h-[80px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border space-y-3">
              <div className="flex items-center justify-between mb-1">
                <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Tag className="w-4 h-4" /> Meta Tags & SEO
                </Label>
              </div>
              {metaTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {metaTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 pl-2.5 pr-1"
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4 hover:bg-slate-200 rounded-full p-0 inline-flex"
                        onClick={() => removeMetaTag(tag)}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                placeholder="Press Enter to add tag... (e.g. technology, react)"
                className="bg-background rounded-lg border-slate-200"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addMetaTag}
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={isCreating || isUpdating}
              onClick={() => handleSubmit("Draft")}
            >
              Save as Draft
            </Button>
            <Button
              className="rounded-xl bg-primary"
              disabled={isCreating || isUpdating}
              onClick={() => handleSubmit("Published")}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Publish Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Expunge Document"
        description="Purge this content index permanently from archives? This action bypasses general restoration logs."
      />
    </DashboardLayout>
  );
}
