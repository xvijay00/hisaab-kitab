"use client";

import React, { useState } from "react";
import { useBusiness } from "../business/business-provider";
import { useAuth } from "../auth/auth-provider";
import { useTheme } from "next-themes";
import {
  Store,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  LogOut,
  User,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { OnboardingWizard } from "../business/onboarding-wizard";

export function Navbar() {
  const { businesses, currentBusiness, setCurrentBusiness, isOwner, membership } = useBusiness();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAddBizModal, setShowAddBizModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Business Selector (or Brand on mobile) */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="max-w-[140px] sm:max-w-[200px]">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentBusiness?.name || "Select Business"}
                </div>
                <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                  <span>{currentBusiness?.type?.replace("_", " ") || "Business"}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {isOwner ? "Owner" : "Staff"}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Dropdown */}
            {bizDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBizDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                    Your Businesses
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {businesses.map((biz) => {
                      const isSelected = biz.id === currentBusiness?.id;
                      return (
                        <button
                          key={biz.id}
                          onClick={() => {
                            setCurrentBusiness(biz);
                            setBizDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="truncate">
                            <div>{biz.name}</div>
                            <div className="text-[10px] font-normal text-slate-400 capitalize">
                              {biz.type.replace("_", " ")}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setBizDropdownOpen(false);
                        setShowAddBizModal(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Shop / Business
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right actions: Theme toggle & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-bold">
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline-block max-w-[120px] truncate">
                {user?.displayName || "My Account"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline-block" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{isOwner ? "Business Owner" : "Staff Member"}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal to add new business */}
      <OnboardingWizard
        isOpen={showAddBizModal}
        onComplete={() => setShowAddBizModal(false)}
      />
    </>
  );
}
