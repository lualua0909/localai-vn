import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing auth token" },
        { status: 401 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();

    return NextResponse.json({
      ok: true,
      profile: userDoc.exists ? userDoc.data() : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load profile",
      },
      { status: 500 }
    );
  }
}
