import { join } from "path";

export const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");

export function resolveLocalMediaUrl(path?: string): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("/")
  ) {
    return path;
  }

  return `/api/media/${path}`;
}
