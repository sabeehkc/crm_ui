"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  CreditCard,
  Receipt,
  Palette,
  ShieldCheck,
  MoreVertical,
  ClipboardList,
  FileText,
  Mail,
  Settings,
  MessageCircle,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BASE_URL } from "@/store/constants";
import { useGetCompanySettingsQuery } from "@/store/services/settingSlice";

export const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    id: "enquiries",
    icon: ShieldCheck,
    label: "Enquiries",
    href: "/admin-crm",
  },
  { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
  // { id: "chat", icon: MessageCircle, label: "Chat", href: "/chat" },
  { id: "projects", icon: Briefcase, label: "Projects", href: "/projects" },
  { id: "payments", icon: CreditCard, label: "Payments", href: "/payments" },
  { id: "expenses", icon: Receipt, label: "Expenses", href: "/expenses" },
  { id: "forms", icon: ClipboardList, label: "Forms", href: "/forms" },
  { id: "shareForm", icon: Share2, label: "Share Form", href: "/shareForm" },
  { id: "content", icon: FileText, label: "Contents", href: "/content" },
  {
    id: "newsletters",
    icon: Mail,
    label: "News Letters",
    href: "/subscriptions",
  },
  { id: "ui", icon: Palette, label: "UI Manager", href: "/ui-manager" },
  { id: "users", icon: Users, label: "Users", href: "/users" },
  {
    id: "companySettings",
    icon: Settings,
    label: "Company Settings",
    href: "/settings",
  },
];
import logo from "../../../public/crm-logo.png";

export function Sidebar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const isAccessGranted = (pageId: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.pages?.includes(pageId) || false;
  };

  const filteredMenuItems = menuItems.filter((item) =>
    isAccessGranted(item.id),
  );

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  const { data: companySettings } = useGetCompanySettingsQuery();
  const companyData = companySettings?.data;

  return (
    <aside className="w-64 border-r bg-sidebar h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b ">
        {companyData?.logo ? (
          <img
            src={`${BASE_URL}${companyData.logo}`}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-contain"
          />
        ) : (
          <img
            src={logo.src}
            alt="Logo"
            className="w-8 h-8 rounded-xl object-contain"
          />
        )}
        <div>
          <h1 className="font-bold text-lg leading-tight text-foreground">
            {companyData?.companyName || "CRM"}
          </h1>
          <p className="text-xs text-muted-foreground">CRM Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 p-2 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredMenuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage
              src={
                user?.profile?.profilePicture
                  ? `${BASE_URL}${user.profile.profilePicture}`
                  : ""
              }
            />
            <AvatarFallback className="bg-primary text-white">
              {getInitials(user?.name || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user?.role || "Guest"}
            </p>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
