"use client";

import React, { useState } from "react";
import { FinancialSummary } from "@/types";
import { paiseToRupee, formatINR, formatDateDisplay } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Info } from "lucide-react";

interface AnalyticsChartsProps {
  summary: FinancialSummary;
  isOwner: boolean;
}

const CATEGORY_COLORS = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // rose
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#64748b", // slate
];

export function AnalyticsCharts({ summary, isOwner }: AnalyticsChartsProps) {
  const [activeChart, setActiveChart] = useState<"trend" | "category" | "net">("trend");

  // Transform dailyTrend for Recharts
  const trendData = summary.dailyTrend.map((d) => ({
    dateKey: d.dateKey,
    displayDate: d.dateKey.slice(5), // "MM-DD"
    income: paiseToRupee(d.income),
    expense: paiseToRupee(d.expense),
    net: paiseToRupee(d.net),
  }));

  // Transform expense categories for Pie chart
  const expenseCategories = summary.categoryBreakdown
    .filter((c) => c.kind === "expense" && c.amount > 0)
    .map((c, idx) => ({
      name: c.categoryName,
      value: paiseToRupee(c.amount),
      percentage: c.percentage,
      color: c.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

  const hasData = summary.transactionCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
      {/* Chart Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Financial Insights & Trends
          </h3>
          <p className="text-xs text-slate-400">
            Daily cashflow velocity and category distribution
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveChart("trend")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeChart === "trend"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Trend
          </button>
          <button
            onClick={() => setActiveChart("category")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeChart === "category"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-amber-500" />
            Expenses
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveChart("net")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeChart === "net"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              Net Cashflow
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <Info className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-semibold">No data in this period to graph</p>
          <p className="text-[11px] mt-1">Add transactions or select a wider date range.</p>
        </div>
      ) : (
        <div className="h-72 w-full">
          {/* Trend Chart (Income vs Expense Area) */}
          {activeChart === "trend" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `₹${Number(val || 0).toLocaleString("en-IN")}`,
                    "",
                  ]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income (+)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense (-)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Category Donut Chart */}
          {activeChart === "category" && (
            <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `₹${Number(val || 0).toLocaleString("en-IN")}`,
                        "Amount",
                      ]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend List */}
              <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto space-y-2 pr-2">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{cat.value.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Net Bar Chart */}
          {activeChart === "net" && isOwner && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="displayDate"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `₹${Number(val || 0).toLocaleString("en-IN")}`,
                    "Net Profit/Loss",
                  ]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="net"
                  name="Daily Net Balance"
                  radius={[6, 6, 0, 0]}
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
