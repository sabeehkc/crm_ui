"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckSquare,
  Hourglass,
  Plus,
  Receipt,
  FileUp,
} from "lucide-react";
import { RecordPaymentModal } from "./components/RecordPaymentModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { GenerateInvoiceModal } from "./components/GenerateInvoiceModal";
import { OverviewTab } from "./components/OverviewTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { BillsTab } from "./components/BillsTab";
import { useGetPaymentOverviewQuery } from "@/store/services/transactionSlice";

const formatAmount = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

export default function PaymentsPage() {
  const { data: overviewRes } = useGetPaymentOverviewQuery();

  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "bills"
  >("overview");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const overview = overviewRes?.data || [];
  const totalBilled = overview.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceived = overview.reduce((s, i) => s + i.receivedAmount, 0);
  const outstanding = overview.reduce((s, i) => s + i.outstandingAmount, 0);

  const summaryCards: {
    title: string;
    amount: string;
    icon: any;
    color: string;
    bg: string;
    indicator?: string;
  }[] = [
    {
      title: "Total Billed",
      amount: formatAmount(totalBilled),
      icon: FileText,
      color: "text-slate-500 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
    {
      title: "Total Received",
      amount: formatAmount(totalReceived),
      icon: CheckSquare,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Outstanding",
      amount: formatAmount(outstanding),
      icon: Hourglass,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Total Expenses",
      amount: "N/A",
      icon: FileUp,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-full mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all project payments, expenses and invoices
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setExpenseModalOpen(true)}
              className="rounded-lg bg-transparent border-muted/50 h-9 px-4 font-semibold text-xs shadow-sm"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Expense
            </Button>
            <Button
              variant="outline"
              onClick={() => setPaymentModalOpen(true)}
              className="rounded-lg bg-transparent border-muted/50 h-9 px-4 font-semibold text-xs shadow-sm"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Payment
            </Button>
            <Button
              onClick={() => setInvoiceModalOpen(true)}
              className="rounded-lg bg-[#c24141] hover:bg-[#a63636] text-white h-9 px-4 font-semibold text-xs border-none shadow-sm"
            >
              <Receipt className="mr-1.5 h-3.5 w-3.5" /> Generate Bill
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {summaryCards.map((card, idx) => (
            <Card
              key={idx}
              className="bg-card border-none rounded-xl p-4 shadow-sm flex items-center min-h-[80px]"
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.bg}`}
                >
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.indicator && (
                  <span className="text-[10px] font-bold text-green-600">
                    {card.indicator}
                  </span>
                )}
                <div className="flex items-center gap-2 justify-end flex-1">
                  <h3 className="text-xl font-bold text-foreground leading-none m-0">
                    {card.amount}
                  </h3>
                  <p className="text-[13px] font-medium text-muted-foreground m-0">
                    {card.title}
                  </p>
                </div>
              </div>
              
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${activeTab === "overview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${activeTab === "transactions" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${activeTab === "bills" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Bills
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "bills" && <BillsTab />}
      </div>

      <RecordPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
      />
      <AddExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
      />
      <GenerateInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
      />
    </DashboardLayout>
  );
}
