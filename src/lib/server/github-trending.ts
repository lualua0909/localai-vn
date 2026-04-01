import { load } from "cheerio";
import { unstable_cache } from "next/cache";

import {
  TRENDING_PERIODS,
  type TrendingPeriod,
  type TrendingRepository,
} from "@/lib/blog-data";
import { fetchWithRetry } from "@/lib/server/fetch-utils";

function getTrendingUrl(period: TrendingPeriod): string {
  return `https://github.com/trending?since=${period}`;
}

function parseStarCount(value: string): number {
  const numeric = value.replace(/[^\d]/g, "");
  return Number.parseInt(numeric, 10) || 0;
}

async function fetchTrendingRepositoriesByPeriodUncached(
  period: TrendingPeriod,
  limit = 20
): Promise<TrendingRepository[]> {
  const response = await fetchWithRetry(getTrendingUrl(period), {
    headers: {
      "User-Agent": "localai-vn-bot/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);
  const repositories: TrendingRepository[] = [];

  $("article.Box-row").each((index, element) => {
    if (repositories.length >= limit) {
      return false;
    }

    const rawRepo = $(element).find("h2 a").text().replace(/\s+/g, "");
    if (!rawRepo.includes("/")) {
      return;
    }

    const [owner, name] = rawRepo.split("/");
    const description = $(element).find("p").first().text().trim();
    const language = $(element)
      .find('[itemprop="programmingLanguage"]')
      .first()
      .text()
      .trim();

    const starsTodayText = $(element)
      .find("span.d-inline-block.float-sm-right")
      .text()
      .trim();

    repositories.push({
      owner,
      name,
      repoName: `${owner}/${name}`,
      repoFullName: `${owner}/${name}`,
      description,
      starsToday: parseStarCount(starsTodayText),
      language: language || "Unknown",
      repoUrl: `https://github.com/${owner}/${name}`,
      trendingPeriod: period,
      githubRank: index + 1,
    });
  });

  return repositories;
}

export const fetchTrendingRepositoriesByPeriod = unstable_cache(
  async (period: TrendingPeriod, limit: number) =>
    fetchTrendingRepositoriesByPeriodUncached(period, limit),
  ["github-trending-by-period"],
  { revalidate: 60 * 30, tags: ["github-trending"] }
);

export async function fetchTrendingRepositories(
  limitPerPeriod = 20,
  periods: TrendingPeriod[] = TRENDING_PERIODS
): Promise<TrendingRepository[]> {
  const results = await Promise.all(
    periods.map((period) =>
      fetchTrendingRepositoriesByPeriod(period, limitPerPeriod)
    )
  );

  const merged = new Map<string, TrendingRepository>();

  for (const repositories of results) {
    for (const repository of repositories) {
      if (!merged.has(repository.repoFullName)) {
        merged.set(repository.repoFullName, repository);
      }
    }
  }

  return Array.from(merged.values());
}
