import { NextResponse } from "next/server";

import { getPublicBlogBySlug } from "@/lib/server/blog-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const blog = await getPublicBlogBySlug(params.slug);

  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ blog });
}
