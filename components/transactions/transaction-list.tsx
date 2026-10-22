"use client";

import React, { useState } from "react";
import { Transaction, Category, TransactionFilter, PaymentMode } from "@/types";
import { formatINR, formatDateDisplay } from "@/lib/utils";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Calendar,
  X,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Building,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  filter: TransactionFilter;
  onFilterChange: (newFilter: TransactionFilter) => void;
  onSelectTransaction: (tx: Transaction) => void;
  loading?: boolean;
}

export function TransactionList({
  transactions,
  categories,
  filter,
  onFilterChange,
  onSelectTransaction,
  loading = false,
}: TransactionListProps) {
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case "upi":
        return <QrCode className="w-3 h-3 text-indigo-500" />;
      case "cash":
        return <Banknote className="w-3 h-3 text-emerald-500" />;
      case "card":
        return <CreditCard className="w-3 h-3 text-amber-500" />;
      case "netbanking":
        return <Building className="w-3 h-3 text-blue-500" />;
      default:
        return <Banknote className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by party, note or amount..."
              value={filter.searchQuery || ""}
              onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filter, searchQuery: "" })}
                className="p-1 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showAdvancedFilter || filter.categoryId || filter.paymentMode !== "all"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Type Filter Pills (All / Income / Expense) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Records" },
            { id: "income", label: "Income Only (+)" },
            { id: "expense", label: "Expenses (-)" },
          ].map((tab) => {
            const isSelected = (filter.type || "all") === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  onFilterChange({
                    ...filter,
                    type: tab.id as "all" | "income" | "expense",
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable */}
        {showAdvancedFilter && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Filter by Category
              </label>
              <select
                value={filter.categoryId || "all"}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    categoryId: e.target.value === "all" ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.kind === "income" ? "[+] " : "[-] "} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Payment Mode
              </label>
              <select
                value={filter.paymentMode || "all"}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    paymentMode: e.target.value as PaymentMode | "all",
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none uppercase font-semibold"
              >
                <option value="all">All Modes</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-18 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No records found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No transactions match your current search or date range. Tap (+) to add a new income or expense.
            </p>
          </div>
        ) : (
          transactions.map((tx) => {
            const cat = catMap.get(tx.categoryId);
            const isIncome = tx.type === "income";

            return (
              <button
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="w-full bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Indicator Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                        {tx.partyName || cat?.name || "Transaction"}
                      </span>
                      {tx.partyName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 truncate hidden xs:inline">
                          {cat?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{formatDateDisplay(tx.dateKey)}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 uppercase font-semibold text-[10px]">
                        {getPaymentIcon(tx.paymentMode)}
                        {tx.paymentMode}
                      </span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px] sm:max-w-[200px] text-slate-500 italic">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount formatted in Indian Rupee */}
                <div className="text-right shrink-0 pl-3">
                  <div
                    className={`font-black text-sm sm:text-base ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatINR(tx.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 transition-colors">
                    Edit / Details →
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
