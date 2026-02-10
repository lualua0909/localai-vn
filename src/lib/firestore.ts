import { getFirebaseDb } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface Lead {
  email: string;
  name: string;
  company: string;
  source: string;
  createdAt: Timestamp;
}

export interface Feedback {
  uid?: string;
  message: string;
  rating?: number;
  page: string;
  createdAt: Timestamp;
}

export async function addLead(data: Omit<Lead, "createdAt">) {
  return addDoc(collection(getFirebaseDb(), "leads"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function addFeedback(data: Omit<Feedback, "createdAt">) {
  return addDoc(collection(getFirebaseDb(), "feedback"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
