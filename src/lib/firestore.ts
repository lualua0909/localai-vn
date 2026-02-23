import { getFirebaseDb } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type { AppDetail } from "./app-data";
import type { BlogPost } from "./blog-data";

// ─── Existing types ───

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

// ─── User Profile ───

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatar: string;
  role: 0 | 1 | 2;
  isActive: boolean;
  createdAt: Timestamp;
  fcmTokens?: string[];
}

// ─── Existing functions ───

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

// ─── User operations ───

export async function createUserProfile(
  profile: Omit<UserProfile, "createdAt">
) {
  return setDoc(doc(getFirebaseDb(), "users", profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  return updateDoc(doc(getFirebaseDb(), "users", uid), data);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as UserProfile);
}

// ─── App / Product operations ───

export async function getApps(): Promise<AppDetail[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "apps"), orderBy("rating", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppDetail);
}

export async function getAppBySlug(
  slug: string
): Promise<AppDetail | null> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "apps"),
      where("slug", "==", slug),
      firestoreLimit(1)
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as AppDetail;
}

export async function getRelatedApps(
  currentAppId: string,
  category: string,
  max: number = 4
): Promise<AppDetail[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "apps"),
      where("category", "==", category),
      firestoreLimit(max + 1)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as AppDetail)
    .filter((a) => a.id !== currentAppId)
    .slice(0, max);
}

export async function getTopApps(max: number = 5): Promise<AppDetail[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "apps"),
      orderBy("rating", "desc"),
      firestoreLimit(max)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppDetail);
}

export async function getTrendingApps(
  max: number = 5
): Promise<AppDetail[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), "apps"),
      where("trending", "==", true),
      firestoreLimit(max)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppDetail);
}

export async function addApp(
  app: Omit<AppDetail, "id">
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "apps"), app);
  return ref.id;
}

export async function updateApp(id: string, data: Partial<AppDetail>) {
  return updateDoc(doc(getFirebaseDb(), "apps", id), data);
}

export async function deleteApp(id: string) {
  return deleteDoc(doc(getFirebaseDb(), "apps", id));
}

// ─── Blog operations ───

export async function getBlogs(): Promise<BlogPost[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "blogs"), orderBy("date", "desc"))
  );
  return snap.docs.map((d) => ({ slug: d.id, ...d.data() }) as BlogPost);
}

export async function getBlogBySlug(
  slug: string
): Promise<BlogPost | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "blogs", slug));
  if (!snap.exists()) return null;
  return { slug: snap.id, ...snap.data() } as BlogPost;
}

export async function addBlog(blog: BlogPost) {
  return setDoc(doc(getFirebaseDb(), "blogs", blog.slug), blog);
}

export async function updateBlog(slug: string, data: Partial<BlogPost>) {
  return updateDoc(doc(getFirebaseDb(), "blogs", slug), data);
}

export async function deleteBlog(slug: string) {
  return deleteDoc(doc(getFirebaseDb(), "blogs", slug));
}

// ─── Category operations ───

export interface Category {
  id: string;
  name: string;
  label_vi: string;
  label_en: string;
  order: number;
}

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), "categories"), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function addCategory(
  cat: Omit<Category, "id">
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "categories"), cat);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  return updateDoc(doc(getFirebaseDb(), "categories", id), data);
}

export async function deleteCategory(id: string) {
  return deleteDoc(doc(getFirebaseDb(), "categories", id));
}

// ─── FCM token operations ───

export async function saveFcmToken(uid: string, token: string) {
  return updateDoc(doc(getFirebaseDb(), "users", uid), {
    fcmTokens: arrayUnion(token),
  });
}

export async function removeFcmToken(uid: string, token: string) {
  return updateDoc(doc(getFirebaseDb(), "users", uid), {
    fcmTokens: arrayRemove(token),
  });
}

export async function getAllFcmTokens(): Promise<string[]> {
  const users = await getAllUsers();
  const tokens: string[] = [];
  for (const u of users) {
    if (u.fcmTokens) tokens.push(...u.fcmTokens);
  }
  return tokens;
}
