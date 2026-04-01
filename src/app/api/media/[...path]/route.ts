import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { join } from "path";
import { DATA_DIR } from "@/lib/local-media";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
  vtt: "text/vtt; charset=utf-8",
  srt: "application/x-subrip; charset=utf-8",
};

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const relativePath = params.path.join("/");
  const fullPath = join(DATA_DIR, relativePath);

  if (!fullPath.startsWith(DATA_DIR)) {
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
