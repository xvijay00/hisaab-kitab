"use client";

import React, { useState } from "react";
import { useBusiness } from "./business-provider";
import { BusinessType } from "@/types";
import { useToast } from "../ui/toast";
import { Utensils, ShoppingCart, Footprints, Store, Sparkles, Check, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export function OnboardingWizard({ isOpen, onComplete }: OnboardingWizardProps) {
  const { createNewBusiness } = useBusiness();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState<BusinessType>("restaurant");
  const [currency] = useState("INR");
  const [timezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const businessTypes: {
    id: BusinessType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: "restaurant",
      title: "Restaurant / Cafe",
      description: "Dine-in, delivery, food ingredients, commercial gas, staff",
      icon: <Utensils className="w-5 h-5 text-amber-500" />,
      color: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20",
    },
    {
      id: "mart",
      title: "Mart / Kirana Store",
      description: "Grocery sales, FMCG stock, inventory purchases, electricity",
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
      color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20",
    },
    {
      id: "shoe_shop",
      title: "Shoe Store / Footwear",
      description: "Counter sales, wholesale stock, showroom rent, commission",
      icon: <Footprints className="w-5 h-5 text-blue-500" />,
      color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
    },
    {
      id: "other",
      title: "Other Retail / Services",
      description: "Direct sales, client bills, daily operating expenses",
      icon: <Store className="w-5 h-5 text-purple-500" />,
      color: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Please enter your business or shop name.");
      return;
    }

    try {
      setLoading(true);
      await createNewBusiness({
        name: name.trim(),
        type,
        currency,
        timezone,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas not supported
      }

      success(`Welcome to HisaabKitab! "${name}" is set up with default categories.`);
      if (onComplete) onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create business";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Quick Setup (30 Seconds)
          </div>
          <h2 className="text-2xl font-black tracking-tight">Setup Your Business Ledger</h2>
          <p className="text-emerald-100 text-xs mt-1 max-w-sm mx-auto">
            HisaabKitab will automatically configure smart categories and daily cashflow tracking for your business.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Shop / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Sweets & Restaurant / Shree Ganesh Mart"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Select Business Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {businessTypes.map((bt) => {
                const isSelected = type === bt.id;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setType(bt.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {bt.icon}
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {bt.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {bt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional defaults info */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Currency</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                INR (₹ - Indian Rupee)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Timezone</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Asia/Kolkata (IST)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Configuring Ledger..." : "Get Started & Create Records"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
