"use client";

import React, { useState } from "react";
import { useBusiness } from "../business/business-provider";
import { getDataService } from "@/lib/services";
import { TransactionType } from "@/types";
import { useToast } from "../ui/toast";
import { Tags, Plus, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const PALETTE = [
  "#10b981",
  "#059669",
  "#34d399",
  "#f59e0b",
  "#d97706",
  "#ef4444",
  "#dc2626",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

export function CategoryManagement() {
  const { currentBusiness, categories, reloadCategories, isOwner } = useBusiness();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<TransactionType>("expense");
  const [color, setColor] = useState(PALETTE[0]);
  const [loading, setLoading] = useState(false);

  if (!currentBusiness) return null;

  const incomeCategories = categories.filter((c) => c.kind === "income");
  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Please enter a category name.");
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      await dataService.createCategory(currentBusiness.id, {
        name: name.trim(),
        kind,
        color,
      });
      success(`Added category "${name.trim()}".`);
      setName("");
      await reloadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!isOwner) return;
    try {
      const dataService = getDataService();
      await dataService.deleteCategory(currentBusiness.id, catId);
      success(`Deleted "${catName}".`);
      await reloadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Categories & Tags
            </h2>
            <p className="text-xs text-slate-400">
              Customize income sources and expense tags tailored to your shop
            </p>
          </div>
        </div>

        {/* Add Category Form (Owner only) */}
        {isOwner && (
          <form
            onSubmit={handleCreateCategory}
            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Online Orders / Raw Vegetables / Packaging"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Type
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as TransactionType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none uppercase font-semibold"
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto py-1 flex-1">
                  {PALETTE.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                        color === c ? "scale-125 ring-2 ring-emerald-500" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Categories Columns (Income & Expense) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Income Categories ({incomeCategories.length})</span>
          </div>

          <div className="space-y-1.5">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || "#10b981" }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                </div>
                {isOwner && !cat.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Expense Categories ({expenseCategories.length})</span>
          </div>

          <div className="space-y-1.5">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || "#ef4444" }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                </div>
                {isOwner && !cat.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
