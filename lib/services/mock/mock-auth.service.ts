import { AuthService } from "../interfaces";
import { UserProfile } from "@/types";

const AUTH_STORAGE_KEY = "hisaabkitab_mock_auth_user";

export const MOCK_GOOGLE_PROFILES: UserProfile[] = [
  {
    uid: "mock-user-rajesh-101",
    displayName: "Rajesh Sharma",
    email: "rajesh.sharma@example.com",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    uid: "mock-user-priya-102",
    displayName: "Priya Patel",
    email: "priya.patel@example.com",
    photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    uid: "mock-user-amit-103",
    displayName: "Amit Verma",
    email: "amit.verma@example.com",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: Date.now() - 7 * 86400000,
  },
];

export class MockAuthService implements AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  private notify() {
    if (typeof window !== "undefined") {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  async signInWithGoogle(chosenProfile?: Partial<UserProfile>): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: chosenProfile?.uid || `mock-google-${Date.now()}`,
      displayName: chosenProfile?.displayName || "Demo Business Owner",
      email: chosenProfile?.email || "owner@hisaabkitab.demo",
      photoURL:
        chosenProfile?.photoURL ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      createdAt: Date.now(),
    };
    this.currentUser = profile;
    this.notify();
    return profile;
  }

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserProfile> {
    if (!email || !password) throw new Error("Email and password are required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");

    const profile: UserProfile = {
      uid: `mock-email-${Date.now()}`,
      email,
      displayName: displayName || email.split("@")[0],
      createdAt: Date.now(),
    };
    this.currentUser = profile;
    this.notify();
    return profile;
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    if (!email || !password) throw new Error("Invalid email or password.");
    
    // Allow any password in mock mode or check length
    const profile: UserProfile = {
      uid: `mock-user-${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`,
      email,
      displayName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      createdAt: Date.now(),
    };
    this.currentUser = profile;
    this.notify();
    return profile;
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!email) throw new Error("Please enter your email.");
    // Simulate sending password reset email
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notify();
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    // immediately invoke with current user
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
}
