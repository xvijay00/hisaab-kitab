"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useBusiness } from "@/components/business/business-provider";
import { getDataService } from "@/lib/services";
import { FinancialSummary, Transaction, TransactionType } from "@/types";
import { getDateRangePreset, getDateKey, formatDateDisplay } from "@/lib/utils";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { DatePresets, DatePresetKey } from "@/components/dashboard/date-presets";
import { QuickEntryModal } from "@/components/transactions/quick-entry-modal";
import { EditTransactionModal } from "@/components/transactions/edit-transaction-modal";
import { ExportModal } from "@/components/export/export-modal";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { currentBusiness, categories, isOwner } = useBusiness();

  // Date range state
  const defaultPreset = getDateRangePreset("last7days");
  const [currentPreset, setCurrentPreset] = useState<DatePresetKey>("last7days");
  const [startDate, setStartDate] = useState(defaultPreset.startDate);
  const [endDate, setEndDate] = useState(defaultPreset.endDate);
  const [periodLabel, setPeriodLabel] = useState(defaultPreset.label);

  // Financial summary & recent transactions
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    transactionCount: 0,
    incomeCount: 0,
    expenseCount: 0,
    categoryBreakdown: [],
    dailyTrend: [],
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [quickAddType, setQuickAddType] = useState<TransactionType>("income");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      setLoading(true);
      const dataService = getDataService();
      const filter = { startDate, endDate };

      const [sum, txs] = await Promise.all([
        dataService.getFinancialSummary(currentBusiness.id, filter),
        dataService.getTransactions(currentBusiness.id, filter),
      ]);

      setSummary(sum);
      setRecentTransactions(txs.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, startDate, endDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for global quick add events
  useEffect(() => {
    const handleGlobalAdd = () => fetchDashboardData();
    window.addEventListener("transaction_added", handleGlobalAdd);
    return () => window.removeEventListener("transaction_added", handleGlobalAdd);
  }, [fetchDashboardData]);

  const handleSelectPreset = (
    preset: DatePresetKey,
    start: string,
    end: string,
    label: string
  ) => {
    setCurrentPreset(preset);
    setStartDate(start);
    setEndDate(end);
    setPeriodLabel(label);
  };

  const handleOpenAdd = (type: TransactionType) => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Active Financial Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentBusiness?.name || "Business Dashboard"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing records for {periodLabel} ({formatDateDisplay(startDate)} - {formatDateDisplay(endDate)})
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd("income")}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>+ Income</span>
          </button>

          <button
            onClick={() => handleOpenAdd("expense")}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>- Expense</span>
          </button>

          <button
            onClick={() => setExportOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            aria-label="Export or Share"
            title="Export or Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Presets Filter Bar */}
      <DatePresets
        currentPreset={currentPreset}
        startDate={startDate}
        endDate={endDate}
        onSelectPreset={handleSelectPreset}
      />

      {/* Metric Stat Cards */}
      <StatCards
        summary={summary}
        isOwner={isOwner}
        periodLabel={periodLabel}
      />

      {/* Visual Charts */}
      <AnalyticsCharts
        summary={summary}
        isOwner={isOwner}
      />

      {/* Recent Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All Records
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No entries recorded in this period.
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isIncome = tx.type === "income";

              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {tx.partyName || cat?.name || "Entry"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {formatDateDisplay(tx.dateKey)} • {tx.paymentMode.toUpperCase()}
                        {tx.note && ` • ${tx.note}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span
                      className={`font-black text-xs sm:text-sm ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}₹{(tx.amount / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuickEntryModal
        isOpen={quickAddOpen}
        initialType={quickAddType}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <EditTransactionModal
        isOpen={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onSuccess={fetchDashboardData}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        transactions={recentTransactions}
        startDate={startDate}
        endDate={endDate}
        periodLabel={periodLabel}
      />
    </div>
  );
}
