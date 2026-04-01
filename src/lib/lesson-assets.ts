"use client";

import { getFirebaseAuth } from "./firebase";
import { resolveLocalMediaUrl } from "./local-media";
import type { VideoSource } from "./course-data";

function isAbsoluteUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("/")
  );
}

export function resolveDocumentLessonUrl(url?: string): string {
  if (!url) return "";
  return resolveLocalMediaUrl(url);
}

export function resolveCourseIdFromAssetPath(url?: string): string {
  if (!url) return "";
  const parts = url.split("/");
  return parts[0] === "courses" ? parts[1] || "" : "";
}

export function getAssetExtension(url?: string): string {
  if (!url) return "";

  try {
    const pathname = isAbsoluteUrl(url)
      ? new URL(url, window.location.origin).pathname
      : url;
    return pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return url.split(".").pop()?.toLowerCase() ?? "";
  }
}

export function getCaptionTrackType(url?: string): "vtt" | "srt" | undefined {
  const extension = getAssetExtension(url);
  if (extension === "vtt" || extension === "srt") return extension;
  return undefined;
}

export function getVideoMimeType(url?: string): string | undefined {
  switch (getAssetExtension(url)) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "avi":
      return "video/x-msvideo";
    case "m3u8":
      return "application/x-mpegURL";
    default:
      return undefined;
  }
}

export function getYoutubeEmbedUrl(url?: string): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = parsed.pathname.replace(/\//g, "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const videoId = parsed.pathname.split("/embed/")[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/shorts/")[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function isYoutubeUrl(url?: string): boolean {
  return Boolean(getYoutubeEmbedUrl(url));
}

export function inferVideoSourceFromUrl(url?: string): VideoSource {
  if (!url) return "upload";
  if (isYoutubeUrl(url)) return "youtube";
  if (isAbsoluteUrl(url)) return "external";
  return "upload";
}

export function isValidHttpUrl(url?: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateVideoSourceInput(
  source: VideoSource,
  url?: string
): string | null {
  if (source === "upload") return null;
  if (!url?.trim()) {
    return source === "youtube"
      ? "Vui lòng nhập URL YouTube."
      : "Vui lòng nhập video URL.";
  }

  if (!isValidHttpUrl(url)) {
    return "URL phải bắt đầu bằng http:// hoặc https://";
  }

  if (source === "youtube" && !isYoutubeUrl(url)) {
    return "URL YouTube không hợp lệ hoặc chưa đúng định dạng.";
  }

  return null;
}

export async function getSignedVideoAssetUrl(
  url: string,
  courseId?: string
): Promise<string> {
  if (isAbsoluteUrl(url)) return url;

  const token = await getFirebaseAuth().currentUser?.getIdToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const resolvedCourseId = courseId || resolveCourseIdFromAssetPath(url);
  if (!resolvedCourseId) {
    throw new Error("Missing courseId");
  }

  const res = await fetch("/api/video/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path: url, courseId: resolvedCourseId }),
  });

  const data = (await res.json().catch(() => null)) as
    | { signedUrl?: string; error?: string }
    | null;

  if (!res.ok || !data?.signedUrl) {
    throw new Error(data?.error || "Failed to sign video URL");
  }

  return data.signedUrl;
}

export async function getSignedVideoLessonUrl(
  url: string,
  courseId?: string
): Promise<string> {
  return getSignedVideoAssetUrl(url, courseId);
}
