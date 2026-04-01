import type { ReadmeAnalysis } from "@/lib/blog-data";
import { fetchWithRetry } from "@/lib/server/fetch-utils";

const README_BRANCHES = ["main", "master"] as const;

function resolveReadmeAssetUrl(_markdown: string, assetPath: string): string {
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }
  return assetPath;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#+\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

function extractBullets(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^([-*+]|\d+\.)\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function extractSection(markdown: string, headings: string[]): string {
  const lines = markdown.split("\n");
  const lowerHeadings = headings.map((heading) => heading.toLowerCase());

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim().toLowerCase();
    if (
      line.startsWith("#") &&
      lowerHeadings.some((heading) => line.includes(heading))
    ) {
      const section: string[] = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (lines[cursor].trim().startsWith("#")) {
          break;
        }
        section.push(lines[cursor]);
      }
      return section.join("\n").trim();
    }
  }

  return "";
}

function firstParagraph(markdown: string): string {
  const plain = stripMarkdown(markdown);
  const [paragraph] = plain.split(/\n\s*\n/);
  return (paragraph || plain).slice(0, 500).trim();
}

function detectLogo(markdown: string): { logoUrl?: string; logoAlt?: string; visualCue?: string } {
  const markdownImages = Array.from(
    markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)
  ).map((match) => ({
    alt: match[1].trim(),
    url: match[2].trim(),
  }));

  const htmlImages = Array.from(
    markdown.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi)
  ).map((match) => ({
    alt: match[2].trim(),
    url: match[1].trim(),
  }));

  const images = [...markdownImages, ...htmlImages].filter((image) => {
    const lower = `${image.alt} ${image.url}`.toLowerCase();
    return !lower.includes("badge") && !lower.includes("shield");
  });

  const candidate = images.find((image) => {
    const lower = `${image.alt} ${image.url}`.toLowerCase();
    return (
      lower.includes("logo") ||
      lower.includes("icon") ||
      lower.includes("brand") ||
      lower.includes("mark")
    );
  }) || images[0];

  if (!candidate) {
    return {};
  }

  const visualCue =
    candidate.alt ||
    candidate.url
      .split("/")
      .pop()
      ?.replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ");

  return {
    logoUrl: candidate.url,
    logoAlt: candidate.alt || undefined,
    visualCue: visualCue || undefined,
  };
}

export async function fetchReadmeMarkdown(
  owner: string,
  repo: string
): Promise<string | null> {
  for (const branch of README_BRANCHES) {
    const response = await fetchWithRetry(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
      {
        headers: {
          "User-Agent": "localai-vn-bot/1.0",
          Accept: "text/plain",
        },
      }
    ).catch(() => null);

    if (response?.ok) {
      return response.text();
    }
  }

  return null;
}

export function analyzeReadme(markdown: string): ReadmeAnalysis {
  const installationSection = extractSection(markdown, [
    "installation",
    "getting started",
    "setup",
    "cài đặt",
  ]);
  const featuresSection = extractSection(markdown, [
    "features",
    "highlights",
    "capabilities",
    "tính năng",
  ]);
  const useCasesSection = extractSection(markdown, [
    "use cases",
    "examples",
    "applications",
    "why",
    "ứng dụng",
  ]);
  const techSection = extractSection(markdown, [
    "tech stack",
    "built with",
    "architecture",
    "stack",
    "công nghệ",
  ]);

  const logo = detectLogo(markdown);

  return {
    projectDescription: firstParagraph(markdown),
    mainFeatures: extractBullets(featuresSection),
    installation: extractBullets(installationSection),
    useCases: extractBullets(useCasesSection),
    techStack: extractBullets(techSection),
    rawExcerpt: stripMarkdown(markdown).slice(0, 6000),
    logoUrl: logo.logoUrl
      ? resolveReadmeAssetUrl(markdown, logo.logoUrl)
      : undefined,
    logoAlt: logo.logoAlt,
    visualCue: logo.visualCue,
  };
}

export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .trim();
}
