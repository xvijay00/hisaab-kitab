"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, BarChart3, Users, Plus } from "lucide-react";

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export function BottomNav({ onOpenQuickAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-2 max-w-lg mx-auto relative">
        {/* Dashboard */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
            pathname === "/"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* Transactions */}
        <Link
          href="/transactions"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
            pathname === "/transactions"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Records</span>
        </Link>

        {/* Floating Quick Add (+) in Center */}
        <div className="flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-950"
            aria-label="Add Transaction"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Reports */}
        <Link
          href="/reports"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
            pathname === "/reports"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </Link>

        {/* Staff / Team */}
        <Link
          href="/staff"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
            pathname === "/staff"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Team</span>
        </Link>
      </div>
    </div>
  );
}
