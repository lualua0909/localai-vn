import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { join } from "path";

const BLOG_DATA_DIR = join(process.cwd(), "blog-data");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const relativePath = params.path.join("/");
  const fullPath = join(BLOG_DATA_DIR, relativePath);

  if (!fullPath.startsWith(BLOG_DATA_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  let fileSize: number;
  try {
    fileSize = statSync(fullPath).size;
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const ext = relativePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const stream = createReadStream(fullPath);
  const readable = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new NextResponse(readable, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
