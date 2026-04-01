import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join, extname, basename } from "path";

import { verifyAdminRequest } from "@/lib/server/admin-auth";
import { slugify } from "@/lib/blog-data";

const BLOG_DATA_DIR = join(process.cwd(), "blog-data");
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminRequest(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slug = (formData.get("slug") as string | null) || "manual-blog";

    if (!file) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported image type" },
        { status: 400 }
      );
    }

    const safeBase = sanitizeFilename(basename(file.name, ext));
    const filename = `${slugify(slug)}_${safeBase}_${Date.now()}${ext}`;
    const relativePath = `uploads/${filename}`;
    const fullPath = join(BLOG_DATA_DIR, relativePath);

    await mkdir(join(BLOG_DATA_DIR, "uploads"), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    return NextResponse.json({
      ok: true,
      coverImage: `/api/blog-data/${relativePath}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Upload cover failed",
      },
      { status: 500 }
    );
  }
}
