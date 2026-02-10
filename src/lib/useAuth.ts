"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInWithPopup(getFirebaseAuth(), googleProvider);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    []
  );

  const signOut = useCallback(async () => {
    return firebaseSignOut(getFirebaseAuth());
  }, []);

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
