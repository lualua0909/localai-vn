import type { TrendingPeriod, TrendingRepository } from "@/lib/blog-data";
import { fetchWithRetry } from "@/lib/server/fetch-utils";

function parseGitHubRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const normalized = repoUrl.trim().replace(/\/+$/, "");
  const match = normalized.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/i);

  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  return { owner: match[1], repo: match[2] };
}

export async function fetchRepositoryByUrl(input: {
  repoUrl: string;
  trendingPeriod?: TrendingPeriod;
  githubRank?: number;
}): Promise<TrendingRepository> {
  const { owner, repo } = parseGitHubRepoUrl(input.repoUrl);
  const response = await fetchWithRetry(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      "User-Agent": "localai-vn-bot/1.0",
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub repo fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    full_name?: string;
    name?: string;
    description?: string;
    html_url?: string;
    language?: string;
    stargazers_count?: number;
    owner?: { login?: string };
  };

  return {
    owner: data.owner?.login || owner,
    name: data.name || repo,
    repoName: data.full_name || `${owner}/${repo}`,
    repoFullName: data.full_name || `${owner}/${repo}`,
    description: data.description || "",
    starsToday: data.stargazers_count || 0,
    language: data.language || "Unknown",
    repoUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    trendingPeriod: input.trendingPeriod || "daily",
    githubRank: input.githubRank || 0,
  };
}
