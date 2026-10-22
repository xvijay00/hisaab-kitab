"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { QuickEntryModal } from "../transactions/quick-entry-modal";
import { GoogleAccountModal } from "../auth/google-account-modal";
import { InstallPwaBanner } from "../pwa/InstallPwaBanner";
import { useAuth } from "../auth/auth-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // If on login/signup/forgot-password, don't show dashboard shell
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  if (isAuthPage || !user) {
    return (
      <main className="min-h-screen">
        {children}
        <GoogleAccountModal />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenQuickAdd={() => setQuickAddOpen(true)} />
      </div>

      {/* Global Modals & Prompts */}
      <QuickEntryModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={() => {
          // Dispatch a custom event so pages can refresh their data
          window.dispatchEvent(new Event("transaction_added"));
        }}
      />
      <GoogleAccountModal />
      <InstallPwaBanner />
    </div>
  );
}
