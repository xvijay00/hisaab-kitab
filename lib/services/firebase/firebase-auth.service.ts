import { AuthService } from "../interfaces";
import { UserProfile } from "@/types";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

function mapFirebaseUser(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    photoURL: user.photoURL || undefined,
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : Date.now(),
  };
}

function formatAuthError(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code: string }).code);
    switch (code) {
      case "auth/unauthorized-domain":
        return "Domain not authorized in Firebase! Please add your Vercel URL to Firebase Console > Authentication > Settings > Authorized Domains.";
      case "auth/operation-not-allowed":
        return "Provider is disabled! Please enable Google or Email/Password in Firebase Console > Authentication > Sign-in method.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      default:
        return (err as { message?: string }).message || "Authentication failed.";
    }
  }
  return err instanceof Error ? err.message : "Authentication failed.";
}

export class FirebaseAuthService implements AuthService {
  async signInWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error(
        "Firebase is not configured yet. Please add your Firebase keys in .env.local as described in FIREBASE_SETUP.md."
      );
    }
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const profile = mapFirebaseUser(result.user);
      if (!profile) throw new Error("Google sign in failed to return a user profile.");
      return profile;
    } catch (err: unknown) {
      throw new Error(formatAuthError(err));
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    try {
      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      const profile = mapFirebaseUser(result.user);
      if (!profile) throw new Error("Sign up failed.");
      return profile;
    } catch (err: unknown) {
      throw new Error(formatAuthError(err));
    }
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = mapFirebaseUser(result.user);
      if (!profile) throw new Error("Invalid email or password.");
      return profile;
    } catch (err: unknown) {
      throw new Error(formatAuthError(err));
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      throw new Error(formatAuthError(err));
    }
  }

  async signOut(): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    await fbSignOut(auth);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (!isFirebaseConfigured()) {
      callback(null);
      return () => {};
    }
    try {
      const auth = getFirebaseAuth();
      return fbOnAuthStateChanged(auth, (user) => {
        callback(mapFirebaseUser(user));
      });
    } catch (e) {
      console.warn("Firebase Auth state listener error:", e);
      callback(null);
      return () => {};
    }
  }

  getCurrentUser(): UserProfile | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const auth = getFirebaseAuth();
      return mapFirebaseUser(auth.currentUser);
    } catch {
      return null;
    }
  }
}
