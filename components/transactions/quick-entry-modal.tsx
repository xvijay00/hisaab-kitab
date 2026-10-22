"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "../business/business-provider";
import { useAuth } from "../auth/auth-provider";
import { getDataService } from "@/lib/services";
import { TransactionType, PaymentMode } from "@/types";
import { rupeeToPaise, getDateKey } from "@/lib/utils";
import { useToast } from "../ui/toast";
import {
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  CreditCard,
  FileText,
  Check,
} from "lucide-react";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: TransactionType;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000];

export function QuickEntryModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = "income",
}: QuickEntryModalProps) {
  const { currentBusiness, categories } = useBusiness();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountRupees, setAmountRupees] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("upi");
  const [note, setNote] = useState("");
  const [dateKey, setDateKey] = useState(getDateKey());
  const [loading, setLoading] = useState(false);

  // Sync initial type when opening
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setDateKey(getDateKey());
    }
  }, [isOpen, initialType]);

  // Set default category when type or categories change
  useEffect(() => {
    const matchingCats = categories.filter((c) => c.kind === type);
    if (matchingCats.length > 0 && !matchingCats.some((c) => c.id === categoryId)) {
      setCategoryId(matchingCats[0].id);
    }
  }, [type, categories, categoryId]);

  if (!isOpen || !currentBusiness) return null;

  const filteredCategories = categories.filter((c) => c.kind === type);

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amountRupees) || 0;
    setAmountRupees(String(current + val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(amountRupees);
    if (!numeric || numeric <= 0) {
      error("Please enter a valid amount.");
      return;
    }
    if (!categoryId) {
      error("Please select a category.");
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      await dataService.createTransaction(currentBusiness.id, {
        type,
        amount: rupeeToPaise(numeric),
        categoryId,
        partyName: partyName.trim() || undefined,
        paymentMode,
        note: note.trim() || undefined,
        dateKey,
        createdBy: user?.uid || "anonymous",
      });

      success(
        `Added ₹${numeric.toLocaleString("en-IN")} ${type === "income" ? "Income" : "Expense"}`
      );

      // Reset form
      setAmountRupees("");
      setPartyName("");
      setNote("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save transaction";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                type === "income"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
              }`}
            >
              {type === "income" ? (
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Quick Record Entry
              </h3>
              <p className="text-[11px] text-slate-400">{currentBusiness.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Income vs Expense Pill Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              + Income / Sale
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              - Expense / Bill
            </button>
          </div>

          {/* Large Amount Input */}
          <div className="relative">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Amount (Rupees)
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-black text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            {/* 1-Tap Quick Amount Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0 transition-colors active:scale-95"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips Selector */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color || "#10b981" }}
                    />
                    <span>{cat.name}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Mode
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["cash", "upi", "card", "netbanking"] as PaymentMode[]).map((mode) => {
                const isSelected = paymentMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Party Name (Customer or Supplier) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {type === "income" ? "Customer Name" : "Supplier / Vendor"} (Optional)
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Date key */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dateKey}
                  onChange={(e) => setDateKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Note / Remarks (Optional)
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Table 4 bill / 20kg rice packet"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !amountRupees || parseFloat(amountRupees) <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
                type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {loading
                ? "Saving..."
                : `Save ${type === "income" ? "Income" : "Expense"} Entry`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
