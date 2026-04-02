import "server-only";

import type { ChatMessage } from "@/lib/llm/gateway";
import type { ReadmeAnalysis, TrendingRepository } from "@/lib/blog-data";

export function buildBlogRewriteMessages(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a senior Vietnamese tech editor. Return only strict JSON with keys: title, summary, content, tags. Content must be valid Markdown in Vietnamese with sections: Gioi thieu, Cac tinh nang chinh, Ung dung thuc te, Ket luan.",
    },
    {
      role: "user",
      content: [
        `Repository: ${input.repository.repoFullName}`,
        `Repo URL: ${input.repository.repoUrl}`,
        `Description: ${input.repository.description || "N/A"}`,
        `Stars in trending period: ${input.repository.starsToday}`,
        `Language: ${input.repository.language}`,
        `Trending period: ${input.repository.trendingPeriod}`,
        `GitHub rank: ${input.repository.githubRank}`,
        "",
        "Structured README analysis from heuristic parser:",
        JSON.stringify(input.analysis, null, 2),
        "",
        "Write a Vietnamese tech blog article.",
        "Requirements:",
        "- Explain what the project does",
        "- Explain key features",
        "- Mention possible use cases",
        "- Keep the explanation simple for developers",
        "- Write it like a tech blog article",
        "- Do not invent unsupported claims",
        "- Mention when details are inferred from the README analysis",
        "",
        "Return JSON only.",
      ].join("\n"),
    },
  ];
}
