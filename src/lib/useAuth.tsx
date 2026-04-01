"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import {
  createUserProfile,
  updateUserProfile,
  type UserProfile,
} from "./firestore";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchServerUserProfile(user: User): Promise<UserProfile | null> {
  const token = await user.getIdToken(true);
  const response = await fetch("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load profile from server");
  }

  const payload = (await response.json()) as {
    ok: boolean;
    profile: UserProfile | null;
  };

  return payload.profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        let profile = await fetchServerUserProfile(nextUser);

        // Auto-activate email/password accounts once the user has verified email.
        if (
          profile &&
          !profile.isActive &&
          nextUser.emailVerified &&
          nextUser.providerData[0]?.providerId === "password"
        ) {
          await updateUserProfile(nextUser.uid, { isActive: true });
          profile = await fetchServerUserProfile(nextUser);
        }

        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profile = await fetchServerUserProfile(user);
    setUserProfile(profile);
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    let profile = await fetchServerUserProfile(result.user);

    if (!profile) {
      const email = result.user.email || "";
      const avatar =
        result.user.photoURL ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(email)}`;
      await createUserProfile({
        uid: result.user.uid,
        email,
        username: email,
        avatar,
        role: 2,
        isActive: true,
      });
      profile = await fetchServerUserProfile(result.user);
    }

    setUser(result.user);
    setUserProfile(profile);
    return result;
  }, []);

  const signInWithGithub = useCallback(async () => {
    const result = await signInWithPopup(getFirebaseAuth(), githubProvider);
    let profile = await fetchServerUserProfile(result.user);

    if (!profile) {
      const email = result.user.email || "";
      const avatar =
        result.user.photoURL ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(email)}`;
      await createUserProfile({
        uid: result.user.uid,
        email,
        username: email,
        avatar,
        role: 2,
        isActive: true,
      });
      profile = await fetchServerUserProfile(result.user);
    }

    setUser(result.user);
    setUserProfile(profile);
    return result;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );
    await sendEmailVerification(result.user);
    await createUserProfile({
      uid: result.user.uid,
      email,
      username: email,
      avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(email)}`,
      role: 2,
      isActive: false,
    });
    return result;
  }, []);

  const resendVerification = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setUserProfile(null);
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithGithub,
      signInWithEmail,
      signUpWithEmail,
      resendVerification,
      refreshProfile,
      signOut,
    }),
    [
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithGithub,
      signInWithEmail,
      signUpWithEmail,
      resendVerification,
      refreshProfile,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
