"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-provider";
import { MOCK_GOOGLE_PROFILES } from "@/lib/services/mock/mock-auth.service";
import { UserProfile } from "@/types";
import { X, UserPlus, Check, ArrowRight } from "lucide-react";

export function GoogleAccountModal() {
  const { showGoogleChooser, setShowGoogleChooser, signInWithGoogle } = useAuth();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showGoogleChooser) return null;

  const handleSelectProfile = async (profile: UserProfile) => {
    try {
      setLoading(true);
      await signInWithGoogle(profile);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    try {
      setLoading(true);
      await signInWithGoogle({
        displayName: customName || customEmail.split("@")[0],
        email: customEmail,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Google G logo */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">Google</span>
            </div>
            <button
              onClick={() => setShowGoogleChooser(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Choose an account</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            to continue to <strong className="text-emerald-600 dark:text-emerald-400">HisaabKitab</strong>
          </p>
        </div>

        {/* Account list or custom form */}
        <div className="p-6 pt-4">
          {!isCustomMode ? (
            <div className="space-y-2.5">
              {MOCK_GOOGLE_PROFILES.map((profile) => (
                <button
                  key={profile.uid}
                  disabled={loading}
                  onClick={() => handleSelectProfile(profile)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition-all active:scale-[0.99] group"
                >
                  {/* Avatar */}
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {profile.displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              <button
                disabled={loading}
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Use another Google account</p>
                  <p className="text-xs text-slate-500">Sign in with a custom name or email</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Continue as {customName || "User"}
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-5 leading-relaxed">
            By signing in, Google shares your profile name, email, and photo with HisaabKitab. See privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
