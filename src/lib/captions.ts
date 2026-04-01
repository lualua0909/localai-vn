export interface TranscriptCue {
  id: string;
  start: number;
  end: number;
  text: string;
}

function parseTimestamp(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parts = normalized.split(":");

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return (
      Number(hours) * 3600 +
      Number(minutes) * 60 +
      Number(seconds)
    );
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return Number(minutes) * 60 + Number(seconds);
  }

  return Number(normalized);
}

export function parseCaptionTranscript(content: string): TranscriptCue[] {
  const normalized = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!normalized) return [];

  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const cues: TranscriptCue[] = [];

  for (const block of blocks) {
    if (block === "WEBVTT") continue;
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const timelineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timelineIndex === -1) continue;

    const [startRaw, endRaw] = lines[timelineIndex]
      .split("-->")
      .map((part) => part.trim().split(" ")[0]);

    const text = lines
      .slice(timelineIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (!text) continue;

    const start = parseTimestamp(startRaw);
    const end = parseTimestamp(endRaw);

    if (Number.isNaN(start) || Number.isNaN(end)) continue;

    cues.push({
      id: `cue-${cues.length}-${Math.round(start * 1000)}`,
      start,
      end,
      text,
    });
  }

  return cues;
}

export function formatTranscriptTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainder
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
