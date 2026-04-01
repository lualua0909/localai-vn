import { NextResponse } from "next/server";

import { verifyAdminRequest } from "@/lib/server/admin-auth";
import { getBlogBySlugAdmin, saveGeneratedBlog } from "@/lib/server/blog-store";
import { fetchRepositoryByUrl } from "@/lib/server/github-repo";
import {
  generateVietnameseBlogArticleDetailed,
  getConfiguredWriterTargetLabels,
} from "@/lib/server/openai-blog";
import { analyzeReadme, fetchReadmeMarkdown, sanitizeMarkdown } from "@/lib/server/readme-parser";

export async function POST(request: Request) {
  try {
    await verifyAdminRequest(request);
    const body = (await request.json()) as { slug?: string };
    if (!body.slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const totalAttempts = Math.max(1, getConfiguredWriterTargetLabels().length);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
        };

        const fail = (message: string) => {
          send({ type: "error", ok: false, error: message, percent: 100 });
          controller.close();
        };

        void (async () => {
          try {
            send({
              type: "progress",
              percent: 5,
              message: "Đang tải thông tin bài blog...",
            });

            const blog = await getBlogBySlugAdmin(body.slug!);
            if (!blog) {
              fail("Blog not found");
              return;
            }

            send({
              type: "progress",
              percent: 15,
              message: "Đang lấy metadata repository...",
            });

            const repository = await fetchRepositoryByUrl({
              repoUrl: blog.repoUrl,
              trendingPeriod: blog.trendingPeriod,
              githubRank: blog.githubRank,
            });

            send({
              type: "progress",
              percent: 25,
              message: "Đang tải README...",
            });

            const readme = await fetchReadmeMarkdown(repository.owner, repository.name);
            if (!readme) {
              fail("README not found");
              return;
            }

            send({
              type: "progress",
              percent: 35,
              message: "Đang phân tích README...",
            });

            const analysis = analyzeReadme(readme);

            send({
              type: "progress",
              percent: 45,
              message: "Bắt đầu rewrite với AI...",
            });

            const generation = await generateVietnameseBlogArticleDetailed(
              {
                repository,
                analysis,
              },
              {
                onAttemptStart(attempt) {
                  const percent = 45 + Math.floor((attempt.index / totalAttempts) * 35);
                  send({
                    type: "progress",
                    percent,
                    message: "Đang chạy model viết blog...",
                    currentModel: attempt.model,
                    currentProvider: attempt.provider,
                    attempt: attempt.index + 1,
                    totalAttempts: attempt.total,
                  });
                },
                onAttemptComplete(attempt) {
                  const percent = 45 + Math.floor(((attempt.index + 1) / totalAttempts) * 35);
                  send({
                    type: "progress",
                    percent,
                    message: attempt.ok
                      ? "Model đã tạo nội dung thành công."
                      : "Model thất bại, đang chuyển fallback...",
                    currentModel: attempt.model,
                    currentProvider: attempt.provider,
                    attempt: attempt.index + 1,
                    totalAttempts: attempt.total,
                    attemptOk: attempt.ok,
                  });
                },
              }
            );
            const generated = generation.draft;

            send({
              type: "progress",
              percent: 90,
              message: "Đang lưu bài viết...",
              currentModel: generation.model,
              currentProvider: generation.provider,
            });

            const saved = await saveGeneratedBlog({
              slug: blog.slug,
              title: generated.title,
              summary: generated.summary,
              content: sanitizeMarkdown(generated.content),
              repoName: blog.repoName,
              repoFullName: blog.repoFullName,
              repoUrl: blog.repoUrl,
              stars: blog.stars,
              language: blog.language,
              trendingPeriod: blog.trendingPeriod,
              githubRank: blog.githubRank,
              source: blog.source,
              status: "active",
              aiRewritten: true,
              tags: generated.tags ?? blog.tags ?? [],
              coverImage: blog.coverImage,
            });

            send({
              type: "done",
              ok: true,
              percent: 100,
              message: "AI đã rewrite lại bài thành công.",
              blog: saved,
              writer: {
                provider: generation.provider,
                model: generation.model,
                attempts: generation.attempts,
              },
            });
            controller.close();
          } catch (error) {
            fail(error instanceof Error ? error.message : "AI write failed");
          }
        })();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "AI write failed" },
      { status: 500 }
    );
  }
}
