"use client";

import React, { useState } from "react";
import { useBusiness } from "../business/business-provider";
import { getDataService } from "@/lib/services";
import { UserRole, BusinessMember } from "@/types";
import { useToast } from "../ui/toast";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Mail,
  User,
  Check,
} from "lucide-react";

export function StaffManagement() {
  const { currentBusiness, members, reloadMembers, isOwner } = useBusiness();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [loading, setLoading] = useState(false);

  if (!currentBusiness) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      error("Only business owners can invite staff members.");
      return;
    }
    if (!email) {
      error("Please enter email address.");
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      await dataService.addMember(currentBusiness.id, email, role, displayName.trim() || undefined);
      success(`Added ${displayName || email} as ${role === "owner" ? "Owner" : "Staff Member"}.`);
      setEmail("");
      setDisplayName("");
      await reloadMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add member";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (member: BusinessMember, newRole: UserRole) => {
    if (!isOwner) return;
    try {
      const dataService = getDataService();
      await dataService.updateMemberRole(currentBusiness.id, member.id, newRole);
      success(`Updated ${member.displayName || member.email} role to ${newRole}.`);
      await reloadMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      error(msg);
    }
  };

  const handleRemoveMember = async (member: BusinessMember) => {
    if (!isOwner) return;
    if (member.role === "owner" && members.filter((m) => m.role === "owner").length <= 1) {
      error("Business must have at least one owner.");
      return;
    }

    try {
      const dataService = getDataService();
      await dataService.removeMember(currentBusiness.id, member.id);
      success(`Removed ${member.displayName || member.email}.`);
      await reloadMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove member";
      error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Team & Staff Management
            </h2>
            <p className="text-xs text-slate-400">
              Manage cashiers, managers and accountants for {currentBusiness.name}
            </p>
          </div>
        </div>

        {/* Roles explanation card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Owner Role
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Full administrative access: view net profit, delete records, edit historical entries, invite team members, and configure settings.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Staff Role
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Counter cashier access: can add daily income and expense records, but cannot view profit summaries or edit/delete past entries.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Form (Owner Only) */}
      {isOwner && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            Invite New Staff / Manager
          </h3>

          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Vikas Kumar (Cashier)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="vikas@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Assign Role
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none uppercase font-semibold"
                >
                  <option value="staff">Staff (Cashier / Entries only)</option>
                  <option value="owner">Owner (Full Admin)</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow transition-all"
                >
                  {loading ? "Adding..." : "Invite"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Current Team Members List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Current Members ({members.length})
        </h3>

        <div className="space-y-2">
          {members.map((m) => {
            const isSelf = m.role === "owner" && members.length === 1;

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                    {m.displayName?.[0] || m.email?.[0] || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {m.displayName || m.email}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          m.role === "owner"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{m.email}</div>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={m.role}
                      disabled={isSelf}
                      onChange={(e) => handleRoleChange(m, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-800 dark:text-slate-200 font-semibold"
                    >
                      <option value="owner">Owner</option>
                      <option value="staff">Staff</option>
                    </select>

                    {!isSelf && (
                      <button
                        onClick={() => handleRemoveMember(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        aria-label="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
