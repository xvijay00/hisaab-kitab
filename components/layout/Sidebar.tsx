"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBusiness } from "../business/business-provider";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Users,
  Tags,
  FileSpreadsheet,
  Share2,
  Store,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { isOwner, currentBusiness } = useBusiness();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: Receipt,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: BarChart3,
      ownerOnly: !isOwner, // Note if staff shouldn't view net profits
    },
    {
      label: "Categories",
      href: "/categories",
      icon: Tags,
    },
    {
      label: "Staff & Roles",
      href: "/staff",
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20">
          ₹
        </div>
        <div>
          <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
            HisaabKitab
          </span>
          <span className="text-[10px] block font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Daily Ledger SaaS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.ownerOnly && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  Restricted
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Business Status Pill at bottom of sidebar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentBusiness?.name || "Active Shop"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Role:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {isOwner ? "Owner" : "Staff"}
            </span>
          </div>
          {!isOwner && (
            <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Staff cannot delete old records</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
