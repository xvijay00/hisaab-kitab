"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/components/business/business-provider";
import { getDataService } from "@/lib/services";
import { FinancialSummary } from "@/types";
import { formatINR, paiseToRupee, getDateKey } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Wallet,
} from "lucide-react";

type ReportPeriodKey = "daily" | "monthly" | "quarterly" | "yearly";

export default function ReportsPage() {
  const { currentBusiness, isOwner } = useBusiness();
  const [period, setPeriod] = useState<ReportPeriodKey>("monthly");
  const [loading, setLoading] = useState(true);

  const [currentSummary, setCurrentSummary] = useState<FinancialSummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<FinancialSummary | null>(null);

  const fetchReportData = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      setLoading(true);
      const dataService = getDataService();
      const now = new Date();

      let currentStart = "";
      let currentEnd = "";
      let prevStart = "";
      let prevEnd = "";

      if (period === "daily") {
        // Today vs Yesterday
        currentStart = getDateKey(now);
        currentEnd = currentStart;

        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        prevStart = getDateKey(y);
        prevEnd = prevStart;
      } else if (period === "monthly") {
        // This Month vs Last Month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentStart = getDateKey(thisMonthStart);
        currentEnd = getDateKey(now);

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        prevStart = getDateKey(lastMonthStart);
        prevEnd = getDateKey(lastMonthEnd);
      } else if (period === "quarterly") {
        // Last 3 Months vs Previous 3 Months
        const qStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        currentStart = getDateKey(qStart);
        currentEnd = getDateKey(now);

        const pqStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const pqEnd = new Date(now.getFullYear(), now.getMonth() - 2, 0);
        prevStart = getDateKey(pqStart);
        prevEnd = getDateKey(pqEnd);
      } else if (period === "yearly") {
        // This Year vs Last Year
        const yStart = new Date(now.getFullYear(), 0, 1);
        currentStart = getDateKey(yStart);
        currentEnd = getDateKey(now);

        const pyStart = new Date(now.getFullYear() - 1, 0, 1);
        const pyEnd = new Date(now.getFullYear() - 1, 11, 31);
        prevStart = getDateKey(pyStart);
        prevEnd = getDateKey(pyEnd);
      }

      const [cur, prev] = await Promise.all([
        dataService.getFinancialSummary(currentBusiness.id, {
          startDate: currentStart,
          endDate: currentEnd,
        }),
        dataService.getFinancialSummary(currentBusiness.id, {
          startDate: prevStart,
          endDate: prevEnd,
        }),
      ]);

      setCurrentSummary(cur);
      setPreviousSummary(prev);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, period]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Calculate growth percentages
  const calcGrowth = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const incomeGrowth = calcGrowth(
    currentSummary?.totalIncome || 0,
    previousSummary?.totalIncome || 0
  );
  const expenseGrowth = calcGrowth(
    currentSummary?.totalExpense || 0,
    previousSummary?.totalExpense || 0
  );
  const netGrowth = calcGrowth(
    currentSummary?.netProfit || 0,
    previousSummary?.netProfit || 0
  );

  if (!isOwner) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Owner Access Required
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Periodic financial comparisons, profit growth reports, and burn rate metrics are restricted to business owners. Staff accounts can record daily entries from the Records tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Periodic Growth & Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare current earnings and expenses against the previous cycle
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="grid grid-cols-4 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {[
            { id: "daily", label: "Daily" },
            { id: "monthly", label: "Monthly" },
            { id: "quarterly", label: "3-Month" },
            { id: "yearly", label: "Yearly" },
          ].map((tab) => {
            const isSelected = period === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as ReportPeriodKey)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                incomeGrowth >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {incomeGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {incomeGrowth >= 0 ? `+${incomeGrowth}%` : `${incomeGrowth}%`}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatINR(currentSummary?.totalIncome || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Previous period: {formatINR(previousSummary?.totalIncome || 0)}
            </div>
          </div>
        </div>

        {/* Expense Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                expenseGrowth <= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {expenseGrowth <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {expenseGrowth >= 0 ? `+${expenseGrowth}%` : `${expenseGrowth}%`}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatINR(currentSummary?.totalExpense || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Previous period: {formatINR(previousSummary?.totalExpense || 0)}
            </div>
          </div>
        </div>

        {/* Net Margin Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Profit Margin
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                netGrowth >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {netGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {netGrowth >= 0 ? `+${netGrowth}%` : `${netGrowth}%`}
            </span>
          </div>
          <div>
            <div
              className={`text-2xl font-black ${
                (currentSummary?.netProfit || 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {(currentSummary?.netProfit || 0) >= 0 ? "+" : ""}
              {formatINR(currentSummary?.netProfit || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Previous period: {formatINR(previousSummary?.netProfit || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Expense Categories Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Category Cost Distribution
        </h3>

        <div className="space-y-3">
          {currentSummary?.categoryBreakdown
            .filter((c) => c.kind === "expense" && c.amount > 0)
            .map((cat) => (
              <div key={cat.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.categoryName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatINR(cat.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(cat.percentage, 100)}%`,
                      backgroundColor: cat.color || "#10b981",
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
