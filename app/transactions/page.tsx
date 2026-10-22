"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/components/business/business-provider";
import { getDataService } from "@/lib/services";
import { Transaction, TransactionFilter } from "@/types";
import { getDateRangePreset, formatINR } from "@/lib/utils";
import { TransactionList } from "@/components/transactions/transaction-list";
import { QuickEntryModal } from "@/components/transactions/quick-entry-modal";
import { EditTransactionModal } from "@/components/transactions/edit-transaction-modal";
import { ExportModal } from "@/components/export/export-modal";
import { DatePresets, DatePresetKey } from "@/components/dashboard/date-presets";
import {
  Receipt,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  FileSpreadsheet,
} from "lucide-react";

export default function TransactionsPage() {
  const { currentBusiness, categories } = useBusiness();

  // Date filter state
  const defaultPreset = getDateRangePreset("thisMonth");
  const [currentPreset, setCurrentPreset] = useState<DatePresetKey>("thisMonth");
  const [filter, setFilter] = useState<TransactionFilter>({
    startDate: defaultPreset.startDate,
    endDate: defaultPreset.endDate,
    type: "all",
    paymentMode: "all",
  });
  const [periodLabel, setPeriodLabel] = useState(defaultPreset.label);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"income" | "expense">("income");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      setLoading(true);
      const dataService = getDataService();
      const list = await dataService.getTransactions(currentBusiness.id, filter);
      setTransactions(list);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, filter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Listen for global quick add events
  useEffect(() => {
    const handleGlobalAdd = () => fetchTransactions();
    window.addEventListener("transaction_added", handleGlobalAdd);
    return () => window.removeEventListener("transaction_added", handleGlobalAdd);
  }, [fetchTransactions]);

  const handleSelectPreset = (
    preset: DatePresetKey,
    start: string,
    end: string,
    label: string
  ) => {
    setCurrentPreset(preset);
    setPeriodLabel(label);
    setFilter((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  };

  // Quick totals for currently filtered transactions
  let currentIncome = 0;
  let currentExpense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") currentIncome += t.amount;
    else currentExpense += t.amount;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Daily Ledger & Records
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {transactions.length} records in {periodLabel} (Income: {formatINR(currentIncome)} | Expense: {formatINR(currentExpense)})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setQuickAddType("income");
              setQuickAddOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            + Income
          </button>
          <button
            onClick={() => {
              setQuickAddType("expense");
              setQuickAddOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            - Expense
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Export Records"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Presets */}
      <DatePresets
        currentPreset={currentPreset}
        startDate={filter.startDate || ""}
        endDate={filter.endDate || ""}
        onSelectPreset={handleSelectPreset}
      />

      {/* Transaction List with Search & Advanced Filters */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        filter={filter}
        onFilterChange={setFilter}
        onSelectTransaction={(tx) => setSelectedTx(tx)}
        loading={loading}
      />

      {/* Modals */}
      <QuickEntryModal
        isOpen={quickAddOpen}
        initialType={quickAddType}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={fetchTransactions}
      />

      <EditTransactionModal
        isOpen={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onSuccess={fetchTransactions}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        transactions={transactions}
        startDate={filter.startDate}
        endDate={filter.endDate}
        periodLabel={periodLabel}
      />
    </div>
  );
}
