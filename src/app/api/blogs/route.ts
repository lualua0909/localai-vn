import { NextResponse } from "next/server";

import { getPublicBlogs } from "@/lib/server/blog-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blogs = await getPublicBlogs();
    console.log(`[/api/blogs] Found ${blogs.length} active blogs`);
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("[/api/blogs] Error:", error);
    return NextResponse.json({ blogs: [], error: String(error) }, { status: 500 });
  }
}
