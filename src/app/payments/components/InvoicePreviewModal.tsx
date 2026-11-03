"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";
import { useGetCompanySettingsQuery } from "@/store/services/settingSlice";
import { BASE_URL } from "@/store/constants";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  bill: any;
}

export function InvoicePreviewModal({
  open,
  onOpenChange,
  bill,
}: InvoiceModalProps) {
  const printRef = React.useRef<HTMLDivElement>(null);
  const [closingNote, setClosingNote] = useState(
    "Thank you for your business!",
  );

  const { data: settingsRes } = useGetCompanySettingsQuery();
  const company = settingsRes?.data || ({} as any);

  if (!bill) return null;

  const totalAmt = bill.totalAmount || 0;
  const receivedAmt = bill.receivedAmount || 0;
  const outstandingAmt = totalAmt - receivedAmt;
  const projectName =
    typeof bill.projectId === "object" ? bill.projectId?.name : "Project";

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print this invoice.");
      return;
    }

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((s) => s.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${bill.invoiceNumber || "CRM"}</title>
          ${styles}
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
              padding: 40px !important;
              font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
            }
            textarea {
              border: none !important;
              background: transparent !important;
              resize: none !important;
              outline: none !important;
              box-shadow: none !important;
              width: 100%;
              font-family: inherit;
              color: inherit;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="w-full">
            ${printRef.current.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Give a small delay for browser evaluation of stylesheets
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white dark:bg-card border-border rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-muted/30">
          <DialogTitle className="text-lg font-bold">
            Invoice Preview
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                INVOICE
              </h2>
              <p className="text-sm text-muted-foreground font-bold">
                {bill.invoiceNumber || "INV-000"}
              </p>
              <p className="text-sm text-muted-foreground">
                Date:{" "}
                {new Date(bill.issuedDate || Date.now()).toLocaleDateString(
                  "en-IN",
                )}
              </p>
            </div>
            <div className="text-right">
              {company.logo && (
                <img
                  src={`${BASE_URL}${company.logo}`}
                  alt="Logo"
                  className="h-8 ml-auto mb-2 object-contain"
                />
              )}
              <h2 className="text-xl font-bold text-[#c24141] mb-1">
                {company.companyName || "CRM Technologies"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {company.address || "123 Tech Park, Bangalore"}
              </p>
              <p className="text-sm text-muted-foreground">
                {company.email || "info@crm.com"}
              </p>
              {company.gstNo && (
                <p className="text-sm text-muted-foreground">
                  GST: {company.gstNo}
                </p>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-[#f8f9fc] dark:bg-muted/20 rounded-xl p-4 mb-6">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Bill To
            </p>
            <h3 className="text-[15px] font-bold text-foreground">
              {bill.client}
            </h3>
            <p className="text-sm text-muted-foreground">{projectName}</p>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden border border-muted/30">
            <div className="bg-[#c24141] text-white flex justify-between px-4 py-2 text-sm font-bold">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-muted/30 text-sm">
              <span className="text-foreground font-medium">{projectName}</span>
              <span className="text-foreground font-bold">
                {formatAmount(totalAmt)}
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-muted/30 text-sm">
              <span className="text-green-500 font-medium">Received</span>
              <span className="text-green-500 font-bold">
                -{formatAmount(receivedAmt)}
              </span>
            </div>
            <div className="bg-[#f8f9fc] dark:bg-muted/10 flex justify-between px-4 py-3 text-sm font-bold">
              <span className="text-foreground">Outstanding</span>
              <span className="text-[#c24141]">
                {formatAmount(outstandingAmt)}
              </span>
            </div>
          </div>

          {/* Closing Note */}
          <div className="mt-8 pt-4 border-t border-muted/20">
            {/* <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Closing Note</p> */}
            <Textarea
              value={closingNote}
              onChange={(e) => setClosingNote(e.target.value)}
              placeholder="Enter closing note here..."
              className="border-none bg-transparent p-0 text-sm text-muted-foreground focus-visible:ring-0 resize-none min-h-[60px]"
            />
            {company.signatureName && (
              <div className="mt-2 text-right">
                <p className="text-sm font-bold">From,</p>
                <p className="font-bold text-foreground">
                  {company.signatureName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {company.signatureRole}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {company.name}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Ph : {company.mobileNo}
                </p>
                <p className="text-xs font-medium text-[#c23329]">
                  {company.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-transparent hover:bg-muted/50 border-muted"
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white border-none shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" /> Print PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
