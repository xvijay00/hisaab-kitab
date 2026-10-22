"use client";

import React from "react";
import { FinancialSummary } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Lock,
  Wallet,
} from "lucide-react";

interface StatCardsProps {
  summary: FinancialSummary;
  isOwner: boolean;
  periodLabel: string;
}

export function StatCards({ summary, isOwner, periodLabel }: StatCardsProps) {
  const isNetPositive = summary.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* 1. Total Income Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatINR(summary.totalIncome)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span>{periodLabel}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {summary.incomeCount} Entries
          </span>
        </div>
      </div>

      {/* 2. Total Expense Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatINR(summary.totalExpense)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span>{periodLabel}</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {summary.expenseCount} Entries
          </span>
        </div>
      </div>

      {/* 3. Net Profit / Loss Card (Owner Only Visibility) */}
      <div
        className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all ${
          !isOwner
            ? "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
            : isNetPositive
            ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30"
            : "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Net Profit / Loss
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              !isOwner
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                : isNetPositive
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-rose-500 text-white shadow-md shadow-rose-500/30"
            }`}
          >
            {!isOwner ? (
              <Lock className="w-4 h-4" />
            ) : isNetPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {isOwner ? (
          <>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isNetPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isNetPositive ? "+" : ""}
              {formatINR(summary.netProfit)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-500">
              <span>{periodLabel}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  isNetPositive
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                }`}
              >
                {isNetPositive ? "Net Profitable" : "Net Loss"}
              </span>
            </div>
          </>
        ) : (
          <div className="py-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Access Required</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Profit & loss summaries are restricted to business owners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
