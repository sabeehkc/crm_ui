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
  Check,
  Link as LinkIcon,
  Inbox,
  ShieldAlert,
  Zap,
  Settings as SettingsIcon,
  Database,
  Mail,
  Share2,
  LayoutTemplate,
  Download
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SubmissionTable } from "../../forms/components/SubmissionTable";
import { FieldsBuilder } from "../../forms/components/FieldsBuilder";
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

  const total = form.totalSubmissions || 0;
  const spam = form.spamBlocked || 0;
  const successRate =
    total > 0 ? Math.round(((total - spam) / total) * 100) : 100;

  // Note: need to import Lucide icons appropriately or simulate CalendarDays which is not in upper imports
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/shareForm")}
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
              value="fields"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <LayoutTemplate className="h-4 w-4" /> Form Builder
            </TabsTrigger>
            <TabsTrigger
              value="share"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" /> Share Link
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

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

           {/* --- TAB 3: FIELDS BUILDER --- */}
          <TabsContent
            value="fields"
            className="m-0 focus-visible:outline-none space-y-6"
          >
            <FieldsBuilder formId={formId} initialName={form.name} initialDescription={form.description} initialFields={form.fields} />
          </TabsContent>

          {/* --- TAB 4: SHARE LINK --- */}
          <TabsContent
            value="share"
            className="m-0 focus-visible:outline-none space-y-6"
          >
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" /> Public Share Link
                </CardTitle>
                <CardDescription>
                  Share this public URL directly with your users to start collecting submissions immediately. No website integration required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Form URL</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/f/${form.slug}` : ''}
                        className="pl-9 bg-muted/30 font-medium text-primary rounded-xl h-11"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 px-6 shadow-sm gap-2 whitespace-nowrap"
                      onClick={() => {
                        const url = `${window.location.origin}/f/${form.slug}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" /> Copy Link
                    </Button>
                    <Button
                      className="rounded-xl h-11 px-6 shadow-sm bg-primary gap-2 whitespace-nowrap"
                      onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                    >
                      <Share2 className="h-4 w-4" /> Open Form
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border rounded-xl bg-muted/5">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-border/50">
                    <QRCodeSVG 
                      id="form-qr-code"
                      value={typeof window !== 'undefined' ? `${window.location.origin}/f/${form.slug}` : ''} 
                      size={140} 
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-4 mt-2 sm:mt-0">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">QR Code Ready</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Download a printable QR code for physical events, business cards, and printed marketing materials. Users simply scan to open your hosted form instantly.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl shadow-sm gap-2"
                      onClick={() => {
                        const svg = document.getElementById("form-qr-code");
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL("image/png");
                          const downloadLink = document.createElement("a");
                          downloadLink.download = `qr-code-${form.slug}.png`;
                          downloadLink.href = `${pngFile}`;
                          downloadLink.click();
                        };
                        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                      }}
                    >
                      <Download className="h-4 w-4" /> Download PNG
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
