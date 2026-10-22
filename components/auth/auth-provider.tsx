"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/types";
import { getAuthService } from "@/lib/services";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (chosenProfile?: Partial<UserProfile>) => Promise<UserProfile>;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  showGoogleChooser: boolean;
  setShowGoogleChooser: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  useEffect(() => {
    const authService = getAuthService();
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (chosenProfile?: Partial<UserProfile>) => {
    const authService = getAuthService();
    const result = await authService.signInWithGoogle(chosenProfile);
    setUser(result);
    setShowGoogleChooser(false);
    return result;
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    const authService = getAuthService();
    const result = await authService.signInWithEmail(email, pass);
    setUser(result);
    return result;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string, name?: string) => {
    const authService = getAuthService();
    const result = await authService.signUpWithEmail(email, pass, name);
    setUser(result);
    return result;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const authService = getAuthService();
    await authService.sendPasswordReset(email);
  }, []);

  const signOut = useCallback(async () => {
    const authService = getAuthService();
    await authService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        showGoogleChooser,
        setShowGoogleChooser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
