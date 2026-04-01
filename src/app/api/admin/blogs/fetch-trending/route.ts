import { NextResponse } from "next/server";

import type { TrendingPeriod } from "@/lib/blog-data";
import { verifyAdminRequest } from "@/lib/server/admin-auth";
import { runGithubTrendingBlogGeneration } from "@/lib/server/blog-generator";
import { acquireBlogGenerationLock } from "@/lib/server/blog-job-lock";

export async function POST(request: Request) {
  const lock = acquireBlogGenerationLock();
  if (!lock.ok) {
    return NextResponse.json(
      { ok: false, error: lock.reason },
      { status: 429 }
    );
  }

  try {
    await verifyAdminRequest(request);

    const body = (await request.json()) as {
      period?: TrendingPeriod;
      limit?: number;
    };

    const periods = body.period ? [body.period] : undefined;
    const limit = body.limit ?? 20;

    const result = await runGithubTrendingBlogGeneration(limit, periods);

    return NextResponse.json({
      ok: true,
      periods: periods ?? ["daily", "weekly", "monthly"],
      crawled: result.crawled.length,
      created: result.created.length,
      skipped: result.skipped,
      blogs: result.created,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch trending blogs";
    const status =
      message === "Missing auth token"
        ? 401
        : message === "Admin access required"
          ? 403
          : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
  } finally {
    lock.release();
  }
}
