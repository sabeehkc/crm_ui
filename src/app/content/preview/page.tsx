"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetPostDetailsQuery } from "@/store/services/postSlice";
import { BASE_URL } from "@/store/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Eye,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  PlayCircle,
  TrendingUp,
  Heart,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

function PostPreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");
  const identifier = slug || id;

  const {
    data: postDetails,
    isLoading,
    error,
  } = useGetPostDetailsQuery(identifier || "", { skip: !identifier });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium">
          Retrieving narrative draft...
        </p>
      </div>
    );
  }

  if (error || !postDetails?.data) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
          <Eye className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Unable to load preview
        </h2>
        <p className="text-sm text-slate-500 max-w-sm">
          The post ID is invalid, missing, or has been expunged from the
          archives.
        </p>
        <Button
          onClick={() => router.push("/content")}
          className="rounded-xl mt-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const post = postDetails.data;
  const publishDate = post.publishDate || post.updatedAt;
  const formattedDate = new Date(publishDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate generic reading time (average 200 words per minute)
  const calculateReadTime = () => {
    let wordCount = 0;
    if (Array.isArray(post.content)) {
      post.content.forEach((block: any) => {
        if (block.content) wordCount += block.content.split(/\s+/).length;
        if (Array.isArray(block.items)) {
          block.items.forEach((item: string) => {
            wordCount += item.split(/\s+/).length;
          });
        }
      });
    }
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans pb-32">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 px-4 h-16 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.push("/content")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Story Preview Mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="font-semibold py-1 px-3 rounded-full border-slate-200 dark:border-slate-800"
          >
            {post.status}
          </Badge>
          <Button
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 shadow-sm shadow-emerald-600/20"
            onClick={() => router.push(`/content/create?id=${post._id}`)}
          >
            <Pencil className="w-4 h-4 mr-2" /> Edit Story
          </Button>
        </div>
      </div>

      {/* Main Column Container */}
      <main className="max-w-[720px] mx-auto px-6 pt-8 sm:pt-16 transition-all">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 dark:bg-primary/10 py-1 px-3 rounded-full border border-primary/10">
            {post.category}
          </span>
        </div>

        {/* Post Title */}
        <h1 className="text-slate-900 dark:text-slate-100 font-extrabold tracking-tight leading-[1.15] mb-4 text-[38px] sm:text-[46px] md:text-[50px] font-sans">
          {post.title}
        </h1>

        {/* Post Subtitle / Summary */}
        {post.summary && (
          <p className="text-slate-500 dark:text-slate-400 font-sans text-xl md:text-2xl font-light leading-normal tracking-tight mb-8">
            {post.summary}
          </p>
        )}

        {/* Author Header */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border border-slate-200 dark:border-slate-800 shadow-xs">
              <AvatarImage src={post.author?.profile?.avatar || ""} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm">
                {getInitials(post.author?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer text-[15px]">
                  {post.author?.name || "Content Team"}
                </span>
                <span className="text-[13px] font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 cursor-pointer">
                  Follow
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                <span>{calculateReadTime()}</span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social / Engagement Bar */}
        {/* <div className="border-y border-slate-100 dark:border-slate-800/80 py-3.5 my-8 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <Heart className="w-[19px] h-[19px]" />
              <span className="text-[13px] font-medium">5.9K</span>
            </button>
            <button className="flex items-center gap-2 hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <MessageSquare className="w-[19px] h-[19px]" />
              <span className="text-[13px] font-medium">62</span>
            </button>
            <button className="flex items-center gap-2 hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <TrendingUp className="w-[19px] h-[19px]" />
              <span className="text-[13px] font-medium">27</span>
            </button>
          </div>
          <div className="flex items-center gap-5">
            <button className="hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <Bookmark className="w-[19px] h-[19px]" />
            </button>
            <button className="hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <PlayCircle className="w-[19px] h-[19px]" />
            </button>
            <button className="hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <Share2 className="w-[19px] h-[19px]" />
            </button>
            <button className="hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <MoreHorizontal className="w-[19px] h-[19px]" />
            </button>
          </div>
        </div> */}

        {/* Narrative Article Content */}
        <article className="font-serif text-[18px] sm:text-[20px] text-slate-800 dark:text-slate-200 leading-[1.65] space-y-7 tracking-normal wrap-break-word pr-2">
          {Array.isArray(post.content) && post.content.length > 0 ? (
            post.content.map((block: any) => {
              switch (block.type) {
                case "paragraph":
                  return (
                    <p
                      key={block.id}
                      className="min-h-[1.5em] leading-[1.7] whitespace-pre-wrap font-serif font-light"
                    >
                      {block.content}
                    </p>
                  );
                case "h1":
                  return (
                    <h2
                      key={block.id}
                      className="text-2xl sm:text-3xl font-bold font-sans tracking-tight mt-10 mb-4 text-slate-900 dark:text-slate-100 leading-tight"
                    >
                      {block.content}
                    </h2>
                  );
                case "h2":
                  return (
                    <h3
                      key={block.id}
                      className="text-xl sm:text-2xl font-bold font-sans tracking-tight mt-8 mb-3 text-slate-900 dark:text-slate-100 leading-tight"
                    >
                      {block.content}
                    </h3>
                  );
                case "quote":
                  return (
                    <blockquote
                      key={block.id}
                      className="border-l-4 border-slate-900 dark:border-slate-100 pl-6 italic text-slate-700 dark:text-slate-300 my-8 text-xl font-light py-1 font-serif leading-relaxed"
                    >
                      {block.content}
                    </blockquote>
                  );
                case "divider":
                  return (
                    <div key={block.id} className="py-10 flex justify-center">
                      <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    </div>
                  );
                case "code":
                  return (
                    <pre
                      key={block.id}
                      className="bg-slate-950 text-slate-100 p-5 rounded-xl font-mono text-sm overflow-x-auto my-6 border border-slate-900 shadow-inner leading-normal"
                    >
                      <code>{block.content}</code>
                    </pre>
                  );
                case "bullet-list":
                  return (
                    <ul
                      key={block.id}
                      className="list-disc pl-8 space-y-3 my-6 font-serif font-light text-[18px] sm:text-[20px]"
                    >
                      {Array.isArray(block.items) &&
                        block.items.map((item: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                    </ul>
                  );
                case "numbered-list":
                  return (
                    <ol
                      key={block.id}
                      className="list-decimal pl-8 space-y-3 my-6 font-serif font-light text-[18px] sm:text-[20px]"
                    >
                      {Array.isArray(block.items) &&
                        block.items.map((item: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                    </ol>
                  );
                case "image":
                  return (
                    <figure
                      key={block.id}
                      className="my-8 flex flex-col gap-2.5"
                    >
                      <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        {block.data?.url ? (
                          <img
                            src={`${BASE_URL}${block.data.url}`}
                            alt={block.data.caption || ""}
                            className="w-full h-auto object-cover max-h-[500px]"
                          />
                        ) : null}
                      </div>
                      {block.data?.caption && (
                        <figcaption className="text-center text-xs text-slate-400 font-sans tracking-wide">
                          {block.data.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                case "youtube":
                  return (
                    <div
                      key={block.id}
                      className="my-8 aspect-video rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      {block.data?.url ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${block.data.url}`}
                          className="w-full h-full border-none"
                          allowFullScreen
                          title="Embedded Video"
                        />
                      ) : null}
                    </div>
                  );
                case "callout":
                  return (
                    <div
                      key={block.id}
                      className="bg-indigo-50/50 dark:bg-indigo-950/15 text-indigo-900 dark:text-indigo-200 rounded-xl p-6 border border-indigo-100/50 dark:border-indigo-900/30 my-8 flex gap-4 shadow-xs"
                    >
                      <div className="shrink-0 text-2xl select-none">💡</div>
                      <p className="whitespace-pre-wrap font-sans text-base leading-relaxed font-normal">
                        {block.content}
                      </p>
                    </div>
                  );
                case "qa":
                  const faqs = block.data?.faqs || (block.content ? [{ q: block.content, a: block.data?.answer || "" }] : []);
                  if (faqs.length === 0) return null;
                  return (
                    <div
                      key={block.id}
                      className="my-8 space-y-4 font-serif"
                    >
                      {faqs.map((faq: any, idx: number) => (
                        <details
                          key={idx}
                          className="group border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                        >
                          <summary className="flex items-center justify-between cursor-pointer p-5 sm:p-6 font-sans font-bold text-[18px] sm:text-[20px] text-slate-900 dark:text-slate-100 select-none outline-none">
                            <div className="flex gap-3 items-start pr-4">
                              <span className="text-emerald-600 dark:text-emerald-500">{idx + 1}.</span>
                              <span>{faq.q}</span>
                            </div>
                            <span className="transition-transform duration-200 group-open:rotate-180 shrink-0">
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            </span>
                          </summary>
                          <div className="p-5 sm:p-6 pt-0 sm:pt-0">
                            <div className="flex gap-3 items-start border-t border-slate-100 dark:border-slate-800 pt-5 sm:pt-6">
                              <span className="font-bold text-slate-400 dark:text-slate-600 text-[18px] sm:text-[20px] font-sans mt-0.5">A.</span>
                              <p className="whitespace-pre-wrap font-serif font-light text-[18px] sm:text-[20px] text-slate-700 dark:text-slate-300 leading-[1.7]">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  );
                default:
                  return null;
              }
            })
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic font-light">
              No content blocks exist for this entry.
            </p>
          )}
        </article>
      </main>
    </div>
  );
}

export default function PostPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="text-sm text-slate-500 font-medium">Retrieving narrative draft...</p></div>}>
      <PostPreviewPageContent />
    </Suspense>
  );
}
