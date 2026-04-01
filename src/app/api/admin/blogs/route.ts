import { NextResponse } from "next/server";

import { verifyAdminRequest } from "@/lib/server/admin-auth";
import { getAllBlogsAdmin } from "@/lib/server/blog-store";

export async function GET(request: Request) {
  try {
    await verifyAdminRequest(request);
    const blogs = await getAllBlogsAdmin();
    return NextResponse.json({ ok: true, blogs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load admin blogs";
    const status =
      message === "Missing auth token"
        ? 401
        : message === "Admin access required"
          ? 403
          : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
