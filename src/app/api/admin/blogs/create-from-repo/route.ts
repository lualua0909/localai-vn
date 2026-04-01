import { NextResponse } from "next/server";

import { verifyAdminRequest } from "@/lib/server/admin-auth";
import { acquireBlogGenerationLock } from "@/lib/server/blog-job-lock";
import { processRepositoryToBlog } from "@/lib/server/blog-process";
import { fetchRepositoryByUrl } from "@/lib/server/github-repo";

export async function POST(request: Request) {
  const lock = acquireBlogGenerationLock();
  if (!lock.ok) {
    return NextResponse.json({ ok: false, error: lock.reason }, { status: 429 });
  }

  try {
    await verifyAdminRequest(request);
    const body = (await request.json()) as { repoUrl?: string };
    if (!body.repoUrl) {
      return NextResponse.json({ ok: false, error: "Missing repoUrl" }, { status: 400 });
    }

    const repository = await fetchRepositoryByUrl({ repoUrl: body.repoUrl });
    const blog = await processRepositoryToBlog(repository);

    return NextResponse.json({ ok: true, blog });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Create blog failed" },
      { status: 500 }
    );
  } finally {
    lock.release();
  }
}
