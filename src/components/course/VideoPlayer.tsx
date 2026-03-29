"use client";

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
}

export function VideoPlayer({ url, onEnded }: VideoPlayerProps) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={url}
        controls
        className="w-full h-full"
        onEnded={onEnded}
        controlsList="nodownload"
      />
    </div>
  );
}
