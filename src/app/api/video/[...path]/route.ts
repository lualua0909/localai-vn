import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import { DATA_DIR } from "@/lib/local-media";

const SECRET = process.env.VIDEO_SIGNING_SECRET || "change-me-in-production";
const VIDEOS_DIR = DATA_DIR;

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  pdf: "application/pdf",
  vtt: "text/vtt; charset=utf-8",
  srt: "application/x-subrip; charset=utf-8",
};

function verifyToken(path: string, sig: string, exp: string, uid: string): boolean {
  if (Date.now() > Number(exp)) return false;
  const msg = `${path}:${uid}:${exp}`;
  const expected = crypto.createHmac("sha256", SECRET).update(msg).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { searchParams } = new URL(req.url);
  const sig = searchParams.get("t");
  const exp = searchParams.get("exp");
  const uid = searchParams.get("uid");

  if (!sig || !exp || !uid) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const filePath = params.path.join("/");

  if (!verifyToken(filePath, sig, exp, decodeURIComponent(uid))) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const fullPath = join(VIDEOS_DIR, filePath);

  // Prevent path traversal
  if (!fullPath.startsWith(VIDEOS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  let fileSize: number;
  try {
    fileSize = statSync(fullPath).size;
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : Math.min(start + 1024 * 1024 - 1, fileSize - 1);
    const chunkSize = end - start + 1;

    const stream = createReadStream(fullPath, { start, end });
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
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  }

  // Full file
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
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    },
  });
}
