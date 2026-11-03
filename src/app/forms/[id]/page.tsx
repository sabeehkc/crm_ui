"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Check,
  Link as LinkIcon,
  Activity,
  Inbox,
  ShieldAlert,
  Zap,
  Settings as SettingsIcon,
  Terminal,
  Database,
  Mail,
  Puzzle,
  Send,
  Globe,
  MessageSquare,
  TableProperties,
  Eye,
  EyeOff,
  Share2,
  QrCode,
  LayoutTemplate,
  Download
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ApiCodeBlock } from "../components/ApiCodeBlock";
import { SubmissionTable } from "../components/SubmissionTable";
import { IntegrationCard } from "../components/IntegrationCard";
import { FieldsBuilder } from "../components/FieldsBuilder";
import {
  useGetFormQuery,
  useListSubmissionsQuery,
  useRegenerateFormKeyMutation,
  useUpdateFormMutation,
  useUpdateFormStatusMutation,
} from "@/store/services/formSlice";
import { BASE_URL } from "@/store/constants";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: formRes, isLoading: isFormLoading } = useGetFormQuery(formId, {
    skip: !formId,
  });
  const { data: subRes, isLoading: isSubLoading, refetch: refetchSubmissions } = useListSubmissionsQuery(
    { id: formId, page, limit },
    { skip: !formId },
  );
  const [regenerateKey, { isLoading: isRegenerating }] =
    useRegenerateFormKeyMutation();
  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
  const [updateStatus] = useUpdateFormStatusMutation();

  const form = formRes?.data;
  const submissions = subRes?.data?.items || [];

  const [config, setConfig] = useState({
    name: "",
    domain: "",
    notificationEmails: [] as string[],
    redirectUrl: "",
    successMessage: "",
    senderName: "",
    replyToHeader: "",
    subjectTemplate: "",
    recaptchaEnabled: true,
    honeypotEnabled: true,
    domainLocking: true,
    rateLimit: 5,
  });

  useEffect(() => {
    if (form) {
      setConfig({
        name: form.name || "",
        domain: form.domain || "",
        notificationEmails: form.notificationEmails || [],
        redirectUrl: form.redirectUrl || "",
        successMessage: form.successMessage || "",
        senderName: form.senderName || "",
        replyToHeader: form.replyToHeader || "",
        subjectTemplate: form.subjectTemplate || "",
        recaptchaEnabled: form.recaptchaEnabled ?? true,
        honeypotEnabled: form.honeypotEnabled ?? true,
        domainLocking: form.domainLocking ?? true,
        rateLimit: form.rateLimit || 5,
      });
    }
  }, [form]);

  const handleCopyKey = () => {
    if (!form?.accessKey) return;
    navigator.clipboard.writeText(form.accessKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerate = async () => {
    try {
      await regenerateKey(formId).unwrap();
      toast.success("New access key generated successfully!");
      setIsRegenModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to regenerate key.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateForm({ id: formId, data: config }).unwrap();
      toast.success("Configuration updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Save failed.");
    }
  };

  const handleToggleStatus = async () => {
    if (!form) return;
    try {
      const newStatus = form.status === "Active" ? "Inactive" : "Active";
      await updateStatus({ id: formId, status: newStatus }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const submitUrl = `${BASE_URL}/api/v1/forms/submit`;

  if (isFormLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">
            Loading form details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!form) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">Form not found.</div>
      </DashboardLayout>
    );
  }

  const examples = {
    html: `<form action="${submitUrl}" method="POST">
  <input type="hidden" name="access_key" value="${form.accessKey}">
  
  <label for="name">Name</label>
  <input type="text" name="name" required>
  
  <label for="email">Email</label>
  <input type="email" name="email" required>
  
  <label for="message">Message</label>
  <textarea name="message" required></textarea>
  
  <button type="submit">Send Message</button>
</form>`,
    javascript: `fetch("${submitUrl}", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    body: JSON.stringify({
        access_key: "${form.accessKey}",
        name: "John Doe",
        email: "john@example.com",
        message: "Hello, testing testing!"
    })
})
.then(async (response) => {
    let json = await response.json();
    if (response.status == 200) {
        alert("Form submitted successfully!");
    } else {
        console.log(response);
    }
})
.catch(error => {
    console.log(error);
});`,
    react: `import React, { useState } from "react";

export default function ContactForm() {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "${form.accessKey}");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("${submitUrl}", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json
    }).then((res) => res.json());

    if (res.success) {
      console.log("Success", res);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="name"/>
      <input type="email" name="email"/>
      <textarea name="message"></textarea>
      <button type="submit">Submit Form</button>
    </form>
  );
}`,
  };

  const total = form.totalSubmissions || 0;
  const spam = form.spamBlocked || 0;
  const successRate =
    total > 0 ? Math.round(((total - spam) / total) * 100) : 100;

  const statCards = [
    {
      title: "Total Submissions",
      value: total,
      icon: Inbox,
      trend: "+0%",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Spam Blocked",
      value: spam,
      icon: ShieldAlert,
      trend: "0%",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: Activity,
      trend: "+0%",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Last Submission",
      value: form.lastSubmission
        ? new Date(form.lastSubmission).toLocaleDateString()
        : "N/A",
      icon: CalendarDays,
      trend: "N/A",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  // Note: need to import Lucide icons appropriately or simulate CalendarDays which is not in upper imports
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/forms")}
            className="rounded-full h-9 w-9 p-0 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>{form.domain}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {form.name}
              <Badge
                variant={form.status === "Active" ? "default" : "secondary"}
                className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full text-xs px-2.5"
              >
                {form.status}
              </Badge>
            </h1>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              className="rounded-xl gap-2 shadow-sm"
              onClick={handleCopyKey}
            >
              {copiedKey ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy API Key
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Submissions
                </p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">
                  {total}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  Tracking active
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Inbox className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Spam Blocked
                </p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">
                  {spam}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  Filtered via Honeypot
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">
                  {successRate}%
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  Active Deliveries
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Submission
                </p>
                <h3 className="text-xl font-bold mt-3 text-foreground">
                  {form.lastSubmission
                    ? new Date(form.lastSubmission).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )
                    : "Never"}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Activity Status
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Tabs View */}
        <Tabs defaultValue="submissions" className="w-full mt-8">
          <TabsList className="bg-transparent h-auto p-0 space-x-2 mb-6 border-b border-border/50 w-full rounded-none flex justify-start">
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" /> Submissions ({total || 0})
            </TabsTrigger>
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" /> Form Setup
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <Puzzle className="h-4 w-4" /> Integrations
            </TabsTrigger>
          </TabsList>

          {/* --- TAB 1: FORM SETUP --- */}
          <TabsContent
            value="setup"
            className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6"
          >
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" /> API
                  Configuration
                </CardTitle>
                <CardDescription>
                  Post your submissions directly to this endpoint using your
                  access key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint" className="text-sm font-medium">
                      API Endpoint
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="endpoint"
                        readOnly
                        value={submitUrl}
                        className="bg-muted/30 font-mono text-sm rounded-xl"
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => navigator.clipboard.writeText(submitUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key" className="text-sm font-medium">
                      Access Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="key"
                        type={showKey ? "text" : "password"}
                        readOnly
                        value={form.accessKey || ""}
                        className="bg-muted/30 font-mono text-sm rounded-xl"
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        title={showKey ? "Hide key" : "Show key"}
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleCopyKey}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-xl text-muted-foreground hover:text-foreground"
                        title="Regenerate key"
                        onClick={() => setIsRegenModalOpen(true)}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl">
                  Implementation Examples
                </CardTitle>
                <CardDescription>
                  Copy and paste these working examples into your project to
                  start receiving data.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="bg-muted/50 p-1 inline-flex w-auto rounded-xl mb-4">
                    <TabsTrigger
                      value="html"
                      className="rounded-lg px-4 py-1.5 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
                    >
                      HTML
                    </TabsTrigger>
                    <TabsTrigger
                      value="javascript"
                      className="rounded-lg px-4 py-1.5 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
                    >
                      JavaScript
                    </TabsTrigger>
                    <TabsTrigger
                      value="react"
                      className="rounded-lg px-4 py-1.5 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
                    >
                      React
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="html"
                    className="mt-0 focus-visible:outline-none"
                  >
                    <ApiCodeBlock language="html" code={examples.html} />
                  </TabsContent>
                  <TabsContent
                    value="javascript"
                    className="mt-0 focus-visible:outline-none"
                  >
                    <ApiCodeBlock
                      language="javascript"
                      code={examples.javascript}
                    />
                  </TabsContent>
                  <TabsContent
                    value="react"
                    className="mt-0 focus-visible:outline-none"
                  >
                    <ApiCodeBlock language="jsx" code={examples.react} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 2: SUBMISSIONS --- */}
          <TabsContent
            value="submissions"
            className="m-0 focus-visible:outline-none space-y-6"
          >
            <SubmissionTable
              formId={formId}
              submissions={submissions}
              isLoading={isSubLoading}
              onRefresh={refetchSubmissions}
              page={page}
              limit={limit}
              total={subRes?.data?.total || 0}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </TabsContent>

          {/* --- TAB 3: SETTINGS --- */}
          <TabsContent
            value="settings"
            className="m-0 focus-visible:outline-none space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Settings */}
                <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-muted-foreground" />{" "}
                      Basic Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="formName">Form Name</Label>
                        <Input
                          id="formName"
                          value={config.name}
                          onChange={(e) =>
                            setConfig({ ...config, name: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="domain">Target Domain</Label>
                        <Input
                          id="domain"
                          value={config.domain}
                          onChange={(e) =>
                            setConfig({ ...config, domain: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accessEmail">Access Email Address</Label>
                      <Input
                        id="accessEmail"
                        type="text"
                        value={config.notificationEmails.join(", ")}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notificationEmails: e.target.value
                              .split(",")
                              .map((i) => i.trim()),
                          })
                        }
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        This email receives notifications about new submissions.
                      </p>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <Label htmlFor="redirect">Redirect URL (Optional)</Label>
                      <Input
                        id="redirect"
                        value={config.redirectUrl}
                        onChange={(e) =>
                          setConfig({ ...config, redirectUrl: e.target.value })
                        }
                        placeholder="https://example.com/thanks"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="successMsg">Custom Success Message</Label>
                      <Textarea
                        id="successMsg"
                        value={config.successMessage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            successMessage: e.target.value,
                          })
                        }
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Email Configuration */}
                <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" /> Email
                      Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderName">Sender Name Display</Label>
                        <Input
                          id="senderName"
                          value={config.senderName}
                          onChange={(e) =>
                            setConfig({ ...config, senderName: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="replyTo">Reply-To Header</Label>
                        <Input
                          id="replyTo"
                          value={config.replyToHeader}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              replyToHeader: e.target.value,
                            })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectLine">Subject Template</Label>
                      <Input
                        id="subjectLine"
                        value={config.subjectTemplate}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            subjectTemplate: e.target.value,
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Security & Spam */}
                <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-muted-foreground" />{" "}
                      Security & Spam
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          reCAPTCHA v3
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Invisible bot protection.
                        </p>
                      </div>
                      <Switch
                        checked={config.recaptchaEnabled}
                        onCheckedChange={(val) =>
                          setConfig({ ...config, recaptchaEnabled: val })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Honeypot Field
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Trap automated bot requests.
                        </p>
                      </div>
                      <Switch
                        checked={config.honeypotEnabled}
                        onCheckedChange={(val) =>
                          setConfig({ ...config, honeypotEnabled: val })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Domain Locking
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Only accept from origin domain.
                        </p>
                      </div>
                      <Switch
                        checked={config.domainLocking}
                        onCheckedChange={(val) =>
                          setConfig({ ...config, domainLocking: val })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Rate Limiting
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={config.rateLimit}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rateLimit: parseInt(e.target.value),
                            })
                          }
                          className="w-20 rounded-lg h-8"
                        />
                        <span className="text-xs text-muted-foreground">
                          submissions per minute per IP
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isUpdating}
                    className="w-full rounded-xl py-6 shadow-sm bg-primary font-semibold"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Configuration Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggleStatus}
                    className={`w-full rounded-xl border hover:bg-transparent ${form.status === "Active" ? "text-red-500 hover:text-red-600 border-red-200 dark:border-red-900" : "text-emerald-600 border-emerald-200"}`}
                  >
                    {form.status === "Active"
                      ? "Deactivate Form Endpoint"
                      : "Re-activate Form Endpoint"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* --- TAB 4: INTEGRATIONS --- */}
          <TabsContent
            value="integrations"
            className="m-0 focus-visible:outline-none"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">
                Available Integrations
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automate workflows by forwarding submission data to your
                favorite apps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCard
                name="Slack"
                description="Post new submission data directly to specific Slack channels as incoming alerts."
                icon={<SlackIcon className="w-8 h-8" />}
                status="Connected"
                onToggle={() => {}}
              />
              <IntegrationCard
                name="Discord"
                description="Broadcast submission notifications to your Discord channels using rich webhooks."
                icon={<DiscordIcon className="w-8 h-8" />}
                status="Disconnected"
                onToggle={() => {}}
              />
              <IntegrationCard
                name="Google Sheets"
                description="Append each dynamic submission payload as a new row in a shared spreadsheet automatically."
                icon={<SheetsIcon className="w-8 h-8" />}
                status="Disconnected"
                onToggle={() => {}}
              />
              <IntegrationCard
                name="Telegram"
                description="Receive instant form results through your Telegram bots directly to mobile."
                icon={<Send className="w-8 h-8 text-[#0088cc]" />}
                status="Connected"
                onToggle={() => {}}
              />
              <IntegrationCard
                name="Zapier"
                description="Connect with 5000+ applications via triggers in Zapier's modern visual workflows."
                icon={<Zap className="w-8 h-8 text-[#FF4F00]" />}
                status="Disconnected"
                onToggle={() => {}}
              />
              <IntegrationCard
                name="Custom Webhooks"
                description="Trigger reliable real-time custom HTTP request to multiple specified destination endpoints."
                icon={<Globe className="w-8 h-8 text-blue-500" />}
                status="Disconnected"
                onToggle={() => {}}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteConfirmModal
        isOpen={isRegenModalOpen}
        onClose={() => setIsRegenModalOpen(false)}
        onConfirm={handleRegenerate}
        isLoading={isRegenerating}
        title="Revoke Access Key"
        description="Are you absolutely certain? This terminates current active credentials rendering existing endpoint integration instantly dysfunctional until explicitly rotated manually."
      />
    </DashboardLayout>
  );
}

// Helper component referenced inside Statistics but not imported earlier
const CalendarDays = ({ className }: { className?: string }) => (
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
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

// Brand Inline Icons safely rendered as components
const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 122.8 122.8" fill="#4A154B">
    <path d="M25.8,79.8 c0-7.1-5.8-12.9-12.9-12.9S0,72.7,0,79.8s5.8,12.9,12.9,12.9h12.9V79.8z M32.3,79.8c0,7.1,5.8,12.9,12.9,12.9s12.9-5.8,12.9-12.9V41.1 c0-7.1-5.8-12.9-12.9-12.9s-12.9,5.8-12.9,12.9V79.8z M42.9,25.8c7.1,0,12.9-5.8,12.9-12.9S50,0,42.9,0S30,5.8,30,12.9v12.9H42.9z M42.9,32.3c-7.1,0-12.9,5.8-12.9,12.9s5.8,12.9,12.9,12.9h38.7c7.1,0,12.9-5.8,12.9-12.9s-5.8-12.9-12.9-12.9H42.9z M96.9,42.9 c0,7.1,5.8,12.9,12.9,12.9s12.9-5.8,12.9-12.9s-5.8-12.9-12.9-12.9H96.9V42.9z M90.4,42.9c0-7.1-5.8-12.9-12.9-12.9s-12.9,5.8-12.9,12.9 v38.7c0,7.1,5.8,12.9,12.9,12.9s12.9-5.8,12.9-12.9V42.9z M79.8,96.9c-7.1,0-12.9,5.8-12.9,12.9s5.8,12.9,12.9,12.9s12.9-5.8,12.9-12.9 V96.9H79.8z M79.8,90.4c7.1,0,12.9-5.8,12.9-12.9s-5.8-12.9-12.9-12.9H41.1c-7.1,0-12.9,5.8-12.9,12.9s5.8,12.9,12.9,12.9H79.8z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 127.14 96.36" fill="#5865F2">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.17,16.15,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.24-16.14C130,52.2,122.06,28.52,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

const SheetsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="#0F9D58">
    <path d="M23,2H9C7.895,2,7,2.895,7,4v24c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V4C25,2.895,24.105,2,23,2z M15,24h-4v-4h4V24z M15,18h-4v-4h4V18z M15,12h-4V8h4V12z M21,24h-4v-4h4V24z M21,18h-4v-4h4V18z M21,12h-4V8h4V12z" />
  </svg>
);
