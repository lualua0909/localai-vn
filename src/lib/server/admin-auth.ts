import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

export async function verifyAdminRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing auth token");
  }

  const decoded = await getAdminAuth().verifyIdToken(token);
  const userDoc = await getAdminFirestore().collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;

  if (typeof role !== "number" || role > 1) {
    throw new Error("Admin access required");
  }

  return decoded;
}
