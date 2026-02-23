"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import {
  createUserProfile,
  getUserProfile,
  UserProfile,
} from "./firestore";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
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
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    let profile = await getUserProfile(result.user.uid);
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
      profile = await getUserProfile(result.user.uid);
    }
    setUserProfile(profile);
    return result;
  }, []);

  const signInWithGithub = useCallback(async () => {
    const result = await signInWithPopup(getFirebaseAuth(), githubProvider);
    let profile = await getUserProfile(result.user.uid);
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
      profile = await getUserProfile(result.user.uid);
    }
    setUserProfile(profile);
    return result;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
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
    },
    []
  );

  const resendVerification = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUserProfile(null);
    return firebaseSignOut(getFirebaseAuth());
  }, []);

  return {
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
  };
}
