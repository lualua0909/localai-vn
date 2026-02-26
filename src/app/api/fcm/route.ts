import { NextRequest, NextResponse } from "next/server";
import { getAdminMessaging, getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) return null;
    const role = userDoc.data()?.role;
    if (typeof role !== "number" || role > 1) return null;

    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const adminUid = await verifyAdmin(req);
  if (!adminUid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, target, targetUid } = await req.json();

  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and body are required" },
      { status: 400 }
    );
  }

  const messaging = getAdminMessaging();
  const db = getAdminFirestore();
  let tokens: string[] = [];

  if (target === "specific" && targetUid) {
    const userDoc = await db.collection("users").doc(targetUid).get();
    tokens = userDoc.data()?.fcmTokens || [];
  } else {
    const usersSnap = await db.collection("users").get();
    for (const doc of usersSnap.docs) {
      const fcmTokens = doc.data().fcmTokens;
      if (Array.isArray(fcmTokens)) {
        tokens.push(...fcmTokens);
      }
    }
  }

  if (tokens.length === 0) {
    return NextResponse.json(
      { error: "No FCM tokens found", successCount: 0 },
      { status: 200 }
    );
  }

  const uniqueTokens = Array.from(new Set(tokens));

  const response = await messaging.sendEachForMulticast({
    tokens: uniqueTokens,
    notification: { title, body },
  });

  return NextResponse.json({
    successCount: response.successCount,
    failureCount: response.failureCount,
    total: uniqueTokens.length,
  });
}
