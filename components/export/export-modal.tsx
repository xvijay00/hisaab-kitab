"use client";

import React, { useState } from "react";
import { useBusiness } from "../business/business-provider";
import { Transaction, Category } from "@/types";
import { exportToPDF, exportToExcel, shareToWhatsApp } from "@/lib/utils/export-helpers";
import { useToast } from "../ui/toast";
import {
  X,
  FileText,
  FileSpreadsheet,
  Share2,
  Download,
  Calendar,
  CheckCircle2,
  Users,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  startDate?: string;
  endDate?: string;
  periodLabel?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  transactions,
  startDate,
  endDate,
  periodLabel = "Current Period",
}: ExportModalProps) {
  const { currentBusiness, categories } = useBusiness();
  const { success, error } = useToast();
  const [partyFilter, setPartyFilter] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !currentBusiness) return null;

  // Unique parties from transactions for ledger filtering
  const parties = Array.from(
    new Set(transactions.map((t) => t.partyName).filter(Boolean) as string[])
  );

  const filteredTx = partyFilter
    ? transactions.filter((t) => t.partyName?.toLowerCase() === partyFilter.toLowerCase())
    : transactions;

  const handleExportPDF = () => {
    try {
      setDownloading(true);
      exportToPDF({
        business: currentBusiness,
        transactions: filteredTx,
        categories,
        startDate,
        endDate,
        periodLabel: partyFilter ? `${periodLabel} (${partyFilter})` : periodLabel,
      });
      success("PDF Statement downloaded!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF export failed";
      error(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setDownloading(true);
      exportToExcel({
        business: currentBusiness,
        transactions: filteredTx,
        categories,
        startDate,
        endDate,
        periodLabel: partyFilter ? `${periodLabel} (${partyFilter})` : periodLabel,
      });
      success("Excel spreadsheet downloaded!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Excel export failed";
      error(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      await shareToWhatsApp({
        business: currentBusiness,
        transactions: filteredTx,
        categories,
        periodLabel,
        partyFilter: partyFilter || undefined,
      });
      success("Opened WhatsApp share!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "WhatsApp share failed";
      error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Export & Share Records
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredTx.length} records selected ({periodLabel})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Party/Ledger Filter (Optional) */}
          {parties.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Filter by Customer / Supplier (Optional)
              </label>
              <select
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="">All Parties / Entire Ledger</option>
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2.5">
            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    Share on WhatsApp
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Send clean ledger summary or customer dues directly via WhatsApp
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                Share →
              </span>
            </button>

            {/* PDF Statement */}
            <button
              disabled={downloading}
              onClick={handleExportPDF}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Download PDF Statement
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Includes company header, date range, table and totals
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>

            {/* Excel (.xlsx) */}
            <button
              disabled={downloading}
              onClick={handleExportExcel}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Export to Excel (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Clean spreadsheet with calculated columns and formulas
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
