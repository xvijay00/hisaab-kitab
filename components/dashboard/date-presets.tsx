"use client";

import React, { useState } from "react";
import { getDateRangePreset, getDateKey } from "@/lib/utils";
import { Calendar, ChevronDown, Check } from "lucide-react";

export type DatePresetKey =
  | "today"
  | "yesterday"
  | "last7days"
  | "thisMonth"
  | "last3months"
  | "thisYear"
  | "custom";

interface DatePresetsProps {
  currentPreset: DatePresetKey;
  startDate: string;
  endDate: string;
  onSelectPreset: (preset: DatePresetKey, start: string, end: string, label: string) => void;
}

const PRESETS: { key: DatePresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "Last 7 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "last3months", label: "Last 3 Months" },
  { key: "thisYear", label: "This Year" },
];

export function DatePresets({
  currentPreset,
  startDate,
  endDate,
  onSelectPreset,
}: DatePresetsProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(currentPreset === "custom");
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const handlePresetClick = (key: DatePresetKey) => {
    if (key === "custom") {
      setShowCustomPicker(true);
      return;
    }
    setShowCustomPicker(false);
    const range = getDateRangePreset(key as Exclude<DatePresetKey, "custom">);
    onSelectPreset(key, range.startDate, range.endDate, range.label);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onSelectPreset("custom", customStart, customEnd, "Custom Range");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {PRESETS.map((p) => {
          const isSelected = currentPreset === p.key;
          return (
            <button
              key={p.key}
              onClick={() => handlePresetClick(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          );
        })}

        <button
          onClick={() => handlePresetClick("custom")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all flex items-center gap-1.5 ${
            currentPreset === "custom"
              ? "bg-emerald-600 text-white border-transparent font-bold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Custom Range</span>
        </button>
      </div>

      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustom}
          className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">From:</span>
            <input
              type="date"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">To:</span>
            <input
              type="date"
              required
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
