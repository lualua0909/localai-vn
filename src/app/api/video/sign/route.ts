import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import crypto from "crypto";

const SECRET = process.env.VIDEO_SIGNING_SECRET || "change-me-in-production";
// 2 hours - enough for a full course session
const TTL = 2 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.slice(7);
  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { path, courseId } = await req.json();
  if (!path || !courseId) {
    return NextResponse.json({ error: "Missing path or courseId" }, { status: 400 });
  }

  const db = getAdminFirestore();

  // Admins (role <= 1) bypass enrollment check
  const userDoc = await db.collection("users").doc(uid).get();
  const role = userDoc.data()?.role;
  const isAdmin = typeof role === "number" && role <= 1;

  if (!isAdmin) {
    const enrollSnap = await db
      .collection("enrollments")
      .where("userId", "==", uid)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (enrollSnap.empty) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }
  }

  const exp = Date.now() + TTL;
  const msg = `${path}:${uid}:${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(msg).digest("hex");

  const signedUrl = `/api/video/${path}?t=${sig}&exp=${exp}&uid=${encodeURIComponent(uid)}`;

  return NextResponse.json({ signedUrl });
}
