"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "../business/business-provider";
import { getDataService } from "@/lib/services";
import { Transaction, PaymentMode, TransactionType } from "@/types";
import { paiseToRupee, rupeeToPaise } from "@/lib/utils";
import { useToast } from "../ui/toast";
import { X, Trash2, Check, AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTransactionModal({
  isOpen,
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) {
  const { currentBusiness, categories, isOwner } = useBusiness();
  const { success, error } = useToast();

  const [type, setType] = useState<TransactionType>("income");
  const [amountRupees, setAmountRupees] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [note, setNote] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmountRupees(String(paiseToRupee(transaction.amount)));
      setCategoryId(transaction.categoryId);
      setPartyName(transaction.partyName || "");
      setPaymentMode(transaction.paymentMode);
      setNote(transaction.note || "");
      setDateKey(transaction.dateKey);
      setConfirmDelete(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction || !currentBusiness) return null;

  const filteredCategories = categories.filter((c) => c.kind === type);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      error("Staff members are not permitted to edit existing records.");
      return;
    }

    const numeric = parseFloat(amountRupees);
    if (!numeric || numeric <= 0) {
      error("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      await dataService.updateTransaction(currentBusiness.id, transaction.id, {
        type,
        amount: rupeeToPaise(numeric),
        categoryId,
        partyName: partyName.trim() || "",
        paymentMode,
        note: note.trim() || "",
        dateKey,
      });

      success("Transaction updated successfully!");
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update record";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      error("Staff members are not permitted to delete records.");
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      await dataService.deleteTransaction(currentBusiness.id, transaction.id);
      success("Transaction deleted.");
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete record";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Edit Transaction
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!confirmDelete ? (
          <form onSubmit={handleUpdate} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Type selector */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Expense
              </button>
            </div>

            {/* Amount input */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Amount (Rupees)
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment mode & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Mode
                </div>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase font-semibold"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </div>
                <input
                  type="date"
                  required
                  value={dateKey}
                  onChange={(e) => setDateKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Party Name */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Customer / Supplier Name
              </div>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Optional party name"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            {/* Note */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Note / Remarks
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !isOwner}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isOwner ? "Update Record" : "Staff (View Only)"}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation dialog */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Delete this record?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this entry of ₹
                {paiseToRupee(transaction.amount)}? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition-all"
              >
                {loading ? "Deleting..." : "Yes, Delete Entry"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
