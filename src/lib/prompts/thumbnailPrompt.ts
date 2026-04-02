import "server-only";

import type { ChatMessage } from "@/lib/llm/gateway";
import type { ReadmeAnalysis, TrendingRepository } from "@/lib/blog-data";

const LANGUAGE_BRANDS: Record<string, { gradient: string; accent: string }> = {
  go: { gradient: "cyan to teal", accent: "#00ADD8" },
  rust: { gradient: "burnt orange to copper", accent: "#CE422B" },
  python: { gradient: "golden yellow to electric blue", accent: "#3776AB" },
  typescript: { gradient: "azure blue to indigo", accent: "#3178C6" },
  javascript: { gradient: "yellow to amber", accent: "#F7DF1E" },
  java: { gradient: "red orange to deep slate", accent: "#F89820" },
  csharp: { gradient: "violet to royal blue", accent: "#512BD4" },
  ruby: { gradient: "crimson to warm pink", accent: "#CC342D" },
  php: { gradient: "indigo to steel blue", accent: "#777BB4" },
  swift: { gradient: "orange to coral", accent: "#FA7343" },
  kotlin: { gradient: "purple to orange", accent: "#7F52FF" },
  default: { gradient: "slate gray to graphite", accent: "#94A3B8" },
};

function getLanguageBrand(language: string) {
  const key = language.toLowerCase();
  return LANGUAGE_BRANDS[key] || LANGUAGE_BRANDS.default;
}

function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildSubtitle(
  repository: TrendingRepository,
  analysis: ReadmeAnalysis,
): string {
  const description =
    repository.description ||
    analysis.projectDescription ||
    analysis.mainFeatures[0] ||
    `${repository.language} developer tool`;

  const cleaned = description
    .replace(/\.$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);

  return titleCase(cleaned || `${repository.language} Open Source Tool`);
}

function buildVisualCue(
  repository: TrendingRepository,
  analysis: ReadmeAnalysis,
): string {
  return (
    analysis.visualCue ||
    analysis.logoAlt ||
    analysis.mainFeatures[0] ||
    analysis.useCases[0] ||
    repository.language
  );
}

export function buildThumbnailPromptMessages(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
  title: string;
}): { subtitle: string; messages: ChatMessage[] } {
  const subtitle = buildSubtitle(input.repository, input.analysis);
  const brand = getLanguageBrand(input.repository.language);
  const visualCue = buildVisualCue(input.repository, input.analysis);
  const logoHint = input.analysis.logoUrl
    ? `Detected README logo cue: ${input.analysis.logoAlt || input.analysis.logoUrl}.`
    : "No explicit logo asset detected; create a custom geometric product icon.";

  const prompt = [
    "Use case: ui-mockup",
    "Asset type: YouTube-style tech blog thumbnail",
    "Primary request: create a modern, premium, minimal tech thumbnail for an open-source repository article",
    "Style/medium: clean editorial thumbnail, startup-quality, sharp typography, subtle depth, no clutter",
    "Composition/framing: widescreen 16:9 cover, centered or slightly left-aligned bold repo title, small subtitle beneath, one elegant visual icon, large negative space",
    `Color palette: gradient background ${brand.gradient}, with accent ${brand.accent}`,
    "Lighting/mood: futuristic, crisp, polished, modern, minimal",
    `Subject: repository ${input.repository.repoFullName}`,
    `Text (verbatim): \"${input.title}\" and \"${subtitle}\"`,
    `Scene/backdrop: abstract gradient field inspired by ${input.repository.language}`,
    "Constraints: modern simple layout, no screenshot UI, no watermark, no extra text, no busy patterns, must feel like a top tech company blog cover",
    "Materials/textures: soft glow, glassmorphism hints, subtle grain, thin grid lines",
    `Supporting visual cue: ${visualCue}`,
    logoHint,
  ].join("\n");

  return {
    subtitle,
    messages: [
      {
        role: "system",
        content:
          "Return strict JSON with keys: imagePrompt, styleKeywords, visualCue. Keep imagePrompt concise and production-ready for a thumbnail rendering pipeline.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };
}
