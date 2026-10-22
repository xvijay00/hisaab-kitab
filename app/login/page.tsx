"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { MOCK_GOOGLE_PROFILES } from "@/lib/services/mock/mock-auth.service";
import { useToast } from "@/components/ui/toast";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, Building2 } from "lucide-react";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, setShowGoogleChooser } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);
      success("Logged in successfully!");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (profileIndex: number) => {
    try {
      setLoading(true);
      const profile = MOCK_GOOGLE_PROFILES[profileIndex];
      await signInWithGoogle(profile);
      success(`Signed in as ${profile.displayName}`);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (process.env.NEXT_PUBLIC_BACKEND === "firebase") {
      try {
        setLoading(true);
        await signInWithGoogle();
        success("Signed in with Google!");
        router.push("/");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Google sign in failed";
        error(msg);
      } finally {
        setLoading(false);
      }
    } else {
      setShowGoogleChooser(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-3">
            <span className="text-3xl font-black">₹</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            HisaabKitab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Smart Daily Business Records & Financial Ledger
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Enter your credentials or continue with Google to access your daily ledger.
          </p>

          {/* Primary Google Login Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleClick}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-[0.99] mb-5 disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or with email
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In to HisaabKitab"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Tap Demo Business Accounts:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(0)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  Rajesh S.
                </div>
                <div className="text-[10px] text-slate-500 truncate">Restaurant</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  Priya P.
                </div>
                <div className="text-[10px] text-slate-500 truncate">Daily Mart</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(2)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  Amit V.
                </div>
                <div className="text-[10px] text-slate-500 truncate">Shoe Store</div>
              </button>
            </div>
          </div>
        </div>

        {/* Signup Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}
