"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MediaCaptions,
  MediaCommunitySkin,
  MediaOutlet,
  MediaPlayer,
  MediaPoster,
} from "@vidstack/react";
import {
  getCaptionTrackType,
  getSignedVideoAssetUrl,
  getVideoMimeType,
  getYoutubeEmbedUrl,
} from "@/lib/lesson-assets";
import { resolveLocalMediaUrl } from "@/lib/local-media";
import {
  formatTranscriptTime,
  parseCaptionTranscript,
  type TranscriptCue,
} from "@/lib/captions";
import { Button } from "@/components/ui/Button";
import { Captions, ExternalLink, PlayCircle, Sparkles } from "lucide-react";

type PlayerHandle = HTMLElement & {
  currentTime: number;
  play?: () => Promise<void> | void;
};

interface VideoPlayerProps {
  url: string;
  title?: string;
  courseId?: string;
  posterUrl?: string;
  captionUrl?: string;
  captionLabel?: string;
  captionLanguage?: string;
  onEnded?: () => void;
}

function buildYoutubePlayerUrl(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}rel=0&modestbranding=1&playsinline=1&cc_load_policy=1`;
}

export function VideoPlayer({
  url,
  title,
  courseId,
  posterUrl,
  captionUrl,
  captionLabel,
  captionLanguage,
  onEnded,
}: VideoPlayerProps) {
  const playerRef = useRef<PlayerHandle | null>(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [captionSrc, setCaptionSrc] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptCues, setTranscriptCues] = useState<TranscriptCue[]>([]);
  const [error, setError] = useState("");
  const youtubeEmbedUrl = getYoutubeEmbedUrl(url);
  const youtubePlayerUrl = youtubeEmbedUrl
    ? buildYoutubePlayerUrl(youtubeEmbedUrl)
    : "";
  const posterSrc = useMemo(() => resolveLocalMediaUrl(posterUrl), [posterUrl]);
  const isAdaptiveStream =
    getVideoMimeType(url) === "application/x-mpegURL" ||
    getVideoMimeType(videoSrc) === "application/x-mpegURL";

  useEffect(() => {
    if (!url || youtubeEmbedUrl) {
      setVideoSrc("");
      setCaptionSrc("");
      setError("");
      return;
    }

    let cancelled = false;

    async function loadAssets() {
      try {
        const [resolvedVideoUrl, resolvedCaptionUrl] = await Promise.all([
          getSignedVideoAssetUrl(url, courseId),
          captionUrl
            ? getSignedVideoAssetUrl(captionUrl, courseId)
            : Promise.resolve(""),
        ]);

        if (!cancelled) {
          setVideoSrc(resolvedVideoUrl);
          setCaptionSrc(resolvedCaptionUrl);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Video không khả dụng");
        }
      }
    }

    loadAssets();
    return () => {
      cancelled = true;
    };
  }, [url, courseId, youtubeEmbedUrl, captionUrl]);

  useEffect(() => {
    if (!captionSrc || youtubeEmbedUrl) {
      setTranscriptCues([]);
      return;
    }

    let cancelled = false;

    async function loadTranscript() {
      try {
        const response = await fetch(captionSrc);
        if (!response.ok) throw new Error("Failed to load transcript");
        const content = await response.text();
        if (!cancelled) {
          setTranscriptCues(parseCaptionTranscript(content));
        }
      } catch {
        if (!cancelled) {
          setTranscriptCues([]);
        }
      }
    }

    loadTranscript();
    return () => {
      cancelled = true;
    };
  }, [captionSrc, youtubeEmbedUrl]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleTimeUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ currentTime?: number }>).detail;
      setCurrentTime(detail?.currentTime ?? player.currentTime ?? 0);
    };

    const handleEnded = () => {
      onEnded?.();
    };

    player.addEventListener("time-update", handleTimeUpdate as EventListener);
    player.addEventListener("ended", handleEnded);

    return () => {
      player.removeEventListener(
        "time-update",
        handleTimeUpdate as EventListener,
      );
      player.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  const playerTextTracks = useMemo(() => {
    if (!captionSrc) return [];

    return [
      {
        id: `caption-${captionLanguage || "vi"}`,
        kind: "captions" as const,
        label: captionLabel?.trim() || "CC",
        language: captionLanguage?.trim() || "vi",
        src: captionSrc,
        type: getCaptionTrackType(captionUrl || captionSrc) || "vtt",
        default: true,
      },
    ];
  }, [captionLabel, captionLanguage, captionSrc, captionUrl]);

  const playerSource = useMemo(
    () => ({
      src: videoSrc,
      ...(getVideoMimeType(videoSrc)
        ? { type: getVideoMimeType(videoSrc) }
        : {}),
    }),
    [videoSrc],
  );

  const activeCueId = useMemo(
    () =>
      transcriptCues.find(
        (cue) => currentTime >= cue.start && currentTime < cue.end,
      )?.id || "",
    [currentTime, transcriptCues],
  );

  const handleSeekToCue = async (cue: TranscriptCue) => {
    const player = playerRef.current;
    if (!player) return;

    player.currentTime = cue.start;
    try {
      await player.play?.();
    } catch {
      return;
    }
  };

  if (youtubeEmbedUrl) {
    return (
      <div className="course-video-shell">
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <PlayCircle size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  YouTube lesson
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {title ||
                    "Video được phát bằng YouTube player với controls native."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="course-video-meta-chip">Modern embed</span>
              <span className="course-video-meta-chip">Playback speed</span>
              <span className="course-video-meta-chip">CC / subtitles</span>
            </div>
          </div>

          <Button
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            className="justify-center gap-2"
          >
            <ExternalLink size={16} />
            Mở YouTube
          </Button>
        </div>

        <div className="aspect-video w-full bg-black">
          <iframe
            src={youtubePlayerUrl}
            title={title || "YouTube video player"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-video-shell">
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
            <PlayCircle size={20} />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">Video không khả dụng</p>
            <p className="mx-auto max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
              {error}
            </p>
          </div>
          <Button
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            className="justify-center gap-2"
          >
            <ExternalLink size={16} />
            Mở nguồn video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-video-shell">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <PlayCircle size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                Course player
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {title ||
                  "Trình phát video hiện đại, đồng bộ UI với toàn bộ LMS."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {videoSrc ? (
        <>
          <MediaPlayer
            key={`${videoSrc}:${captionSrc}:${posterSrc}`}
            ref={playerRef}
            className="course-media-player"
            title={title || "Course video lesson"}
            src={playerSource}
            poster={posterSrc}
            textTracks={playerTextTracks}
            controls
            load="visible"
            viewType="video"
            streamType="on-demand"
            aspectRatio={16 / 9}
          >
            {posterSrc ? (
              <MediaPoster
                className="course-media-poster"
                alt={title || "Video poster"}
              />
            ) : null}
            <MediaOutlet />
            <MediaCaptions className="course-media-captions" />
            <MediaCommunitySkin />
          </MediaPlayer>

          {transcriptCues.length ? (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/70 px-5 py-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Captions size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Transcript đồng bộ với subtitle
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Click vào từng câu để nhảy tới đúng timestamp trong video.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                  <Sparkles size={14} />
                  {transcriptCues.length} cue
                </div>
              </div>

              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {transcriptCues.map((cue) => {
                  const isActive = cue.id === activeCueId;

                  return (
                    <button
                      key={cue.id}
                      type="button"
                      onClick={() => handleSeekToCue(cue)}
                      className={`transcript-cue w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "border-accent/30 bg-accent/10 shadow-[0_10px_30px_rgba(10,132,255,0.12)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-accent/20 hover:bg-[var(--color-bg-alt)]"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                          {formatTranscriptTime(cue.start)}
                        </span>
                        {isActive ? (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                            Now playing
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text)]">
                        {cue.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
}
