import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { promisify } from "util";
import { execFile } from "child_process";
import { join, extname, basename, dirname, relative } from "path";
import { DATA_DIR } from "@/lib/local-media";

const execFileAsync = promisify(execFile);

const ALLOWED_EXTENSIONS = {
  lesson: new Set([
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".pdf",
    ".doc",
    ".docx",
    ".vtt",
    ".srt",
  ]),
  "content-image": new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]),
  poster: new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]),
  thumbnail: new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]),
} as const;

type UploadKind = keyof typeof ALLOWED_EXTENSIONS;

async function verifyUploader(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();
    const role = userDoc.data()?.role;
    // role 0 = super admin, 1 = admin, 2 = instructor — all can upload
    if (typeof role !== "number" || role > 2) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

async function tryConvertOfficeToPdf(filePath: string): Promise<string | null> {
  const ext = extname(filePath).toLowerCase();
  if (ext !== ".doc" && ext !== ".docx") return null;

  const outputDir = dirname(filePath);
  const previewPath = join(outputDir, `${basename(filePath, ext)}_preview.pdf`);

  try {
    for (const binary of ["soffice", "libreoffice"]) {
      try {
        await execFileAsync(binary, [
          "--headless",
          "--convert-to",
          "pdf",
          "--outdir",
          outputDir,
          filePath,
        ]);

        const defaultPdfPath = join(outputDir, `${basename(filePath, ext)}.pdf`);
        if (existsSync(defaultPdfPath)) {
          if (defaultPdfPath !== previewPath) {
            const content = await readFile(defaultPdfPath);
            await writeFile(previewPath, content);
          }
          return previewPath;
        }
      } catch {
        continue;
      }
    }

    try {
      const { stdout } = await execFileAsync(
        "/usr/sbin/cupsfilter",
        ["-m", "application/pdf", filePath],
        {
          encoding: "buffer",
          maxBuffer: 20 * 1024 * 1024,
        }
      );

      if (stdout && Buffer.isBuffer(stdout) && stdout.length > 0) {
        await writeFile(previewPath, stdout);
        return previewPath;
      }
    } catch {
      return null;
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const uid = await verifyUploader(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("courseId") as string | null;
  const rawKind = formData.get("kind");
  const kind: UploadKind =
    rawKind === "thumbnail"
      ? "thumbnail"
      : rawKind === "content-image"
        ? "content-image"
        : rawKind === "poster"
          ? "poster"
        : "lesson";

  if (!file || !courseId) {
    return NextResponse.json(
      { error: "Missing file or courseId" },
      { status: 400 }
    );
  }

  // Prevent path traversal in courseId
  if (!/^[a-zA-Z0-9_-]+$/.test(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS[kind].has(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const base = sanitizeFilename(basename(file.name, ext));
  const filename = `${base}_${Date.now()}${ext}`;

  const relativePath =
    kind === "thumbnail"
      ? `courses/${courseId}/thumbnail/${filename}`
      : kind === "poster"
        ? `courses/${courseId}/poster/${filename}`
      : kind === "content-image"
        ? courseId.startsWith("draft-")
          ? `drafts/${courseId}/content/${filename}`
          : `courses/${courseId}/content/${filename}`
        : `courses/${courseId}/${filename}`;
  const filePath = join(DATA_DIR, relativePath);

  // Guard against path traversal
  if (!filePath.startsWith(DATA_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  await mkdir(dirname(filePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const previewPath =
    kind === "lesson" ? await tryConvertOfficeToPdf(filePath) : null;
  const previewRelativePath = previewPath
    ? relative(DATA_DIR, previewPath).replace(/\\/g, "/")
    : undefined;

  return NextResponse.json({
    path: relativePath,
    previewPath: previewRelativePath,
    previewUrl: previewRelativePath ? `/api/media/${previewRelativePath}` : undefined,
    url:
      kind === "thumbnail" || kind === "content-image"
        || kind === "poster"
        ? `/api/media/${relativePath}`
        : undefined,
  });
}
