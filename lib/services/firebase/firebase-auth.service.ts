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

export class FirebaseAuthService implements AuthService {
  async signInWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error(
        "Firebase is not configured yet. Please add your Firebase keys in .env.local as described in FIREBASE_SETUP.md."
      );
    }
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const profile = mapFirebaseUser(result.user);
    if (!profile) throw new Error("Google sign in failed to return a user profile.");
    return profile;
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    const profile = mapFirebaseUser(result.user);
    if (!profile) throw new Error("Sign up failed.");
    return profile;
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = mapFirebaseUser(result.user);
    if (!profile) throw new Error("Invalid email or password.");
    return profile;
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Add your Firebase keys in .env.local.");
    }
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
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
