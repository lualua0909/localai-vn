import type { BlogPost, TrendingRepository } from "@/lib/blog-data";
import {
  createDraftBlog,
  findBlogByRepository,
  saveGeneratedBlog,
  updateBlogAdmin,
} from "@/lib/server/blog-store";
import { generateBlogThumbnail } from "@/lib/server/blog-thumbnail";
import { generateVietnameseBlogArticle } from "@/lib/server/openai-blog";
import {
  analyzeReadme,
  fetchReadmeMarkdown,
  sanitizeMarkdown,
} from "@/lib/server/readme-parser";

export async function processRepositoryToBlog(
  repository: TrendingRepository
): Promise<BlogPost> {
  const existing = await findBlogByRepository(repository.repoFullName);
  if (existing) {
    throw new Error(`Repository already exists: ${repository.repoFullName}`);
  }

  const readmeMarkdown = await fetchReadmeMarkdown(repository.owner, repository.name);
  if (!readmeMarkdown) {
    throw new Error(`README not found: ${repository.repoFullName}`);
  }

  const analysis = analyzeReadme(readmeMarkdown);
  const draft = await createDraftBlog({
    title: repository.name,
    summary:
      analysis.projectDescription ||
      repository.description ||
      `Draft blog for ${repository.repoFullName}`,
    content: "",
    repoName: repository.repoName,
    repoFullName: repository.repoFullName,
    repoUrl: repository.repoUrl,
    stars: repository.starsToday,
    language: repository.language,
    trendingPeriod: repository.trendingPeriod,
    githubRank: repository.githubRank,
    source: "github_trending",
    status: "draft",
    aiRewritten: false,
    tags: [],
  });

  try {
    const generated = await generateVietnameseBlogArticle({
      repository,
      analysis,
    });

    let coverImage: string | undefined;
    try {
      const thumbnail = await generateBlogThumbnail({
        repository,
        analysis,
      });
      coverImage = thumbnail.coverImage;
    } catch {
      coverImage = undefined;
    }

    return await saveGeneratedBlog({
      slug: draft.slug,
      title: generated.title,
      summary: generated.summary,
      content: sanitizeMarkdown(generated.content),
      repoName: repository.repoName,
      repoFullName: repository.repoFullName,
      repoUrl: repository.repoUrl,
      stars: repository.starsToday,
      language: repository.language,
      trendingPeriod: repository.trendingPeriod,
      githubRank: repository.githubRank,
      source: "github_trending",
      status: "active",
      aiRewritten: true,
      tags: generated.tags ?? [],
      coverImage,
    });
  } catch (error) {
    await updateBlogAdmin(draft.slug, {
      status: "draft",
      aiRewritten: false,
    });
    throw error;
  }
}
