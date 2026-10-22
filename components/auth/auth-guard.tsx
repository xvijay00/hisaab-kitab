"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useBusiness } from "../business/business-provider";
import { OnboardingWizard } from "../business/onboarding-wizard";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { businesses, loading: bizLoading } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    const publicPaths = ["/login", "/signup", "/forgot-password"];
    const isPublic = publicPaths.includes(pathname);

    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && isPublic) {
      router.replace("/");
    }
  }, [user, authLoading, mounted, pathname, router]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg animate-pulse">
            <span className="text-2xl font-black">₹</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading HisaabKitab...</span>
          </div>
        </div>
      </div>
    );
  }

  // If on login/signup, allow through
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    return null; // Will redirect
  }

  // If user has no businesses, trigger onboarding modal
  const needsOnboarding = !bizLoading && businesses.length === 0;

  return (
    <>
      <OnboardingWizard isOpen={needsOnboarding} />
      {!needsOnboarding && children}
    </>
  );
}
