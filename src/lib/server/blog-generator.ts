import { revalidateTag } from "next/cache";

import type {
  BlogPost,
  TrendingPeriod,
  TrendingRepository,
} from "@/lib/blog-data";
import {
  findBlogByRepository,
  hasRepositoryIndex,
} from "@/lib/server/blog-store";
import { rateLimitedMap } from "@/lib/server/fetch-utils";
import { fetchTrendingRepositories } from "@/lib/server/github-trending";
import { processRepositoryToBlog } from "@/lib/server/blog-process";

export interface BlogGenerationResult {
  created: BlogPost[];
  skipped: Array<{ repoFullName: string; reason: string }>;
  crawled: TrendingRepository[];
}

export async function runGithubTrendingBlogGeneration(
  limitPerPeriod = 20,
  periods?: TrendingPeriod[]
): Promise<BlogGenerationResult> {
  const repositories = await fetchTrendingRepositories(limitPerPeriod, periods);
  const created: BlogPost[] = [];
  const skipped: Array<{ repoFullName: string; reason: string }> = [];

  await rateLimitedMap(
    repositories,
    async (repository) => {
      try {
        const hasIndex = await hasRepositoryIndex(repository.repoFullName);
        if (hasIndex) {
          skipped.push({
            repoFullName: repository.repoFullName,
            reason: "duplicate_repo_index",
          });
          return;
        }

        const existing = await findBlogByRepository(repository.repoFullName);
        if (existing) {
          skipped.push({
            repoFullName: repository.repoFullName,
            reason: "duplicate_blog",
          });
          return;
        }

        created.push(await processRepositoryToBlog(repository));
      } catch (error) {
        skipped.push({
          repoFullName: repository.repoFullName,
          reason:
            error instanceof Error ? `failed:${error.message}` : "failed:unknown",
        });
      }
    },
    1200
  );

  revalidateTag("blogs");

  return { created, skipped, crawled: repositories };
}
