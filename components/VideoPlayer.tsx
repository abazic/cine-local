"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type VideoPlayerProps = {
  src: string;
  poster?: string | null;
};

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isIframeUrl = src.includes("iframe") || src.includes("videonode.de");

  useEffect(() => {
    if (isIframeUrl) return;

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src, isIframeUrl]);

  if (isIframeUrl) {
    return (
      <iframe
        src={src}
        className="aspect-video w-full rounded-md bg-black border-0"
        allowFullScreen
      />
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      poster={poster ?? undefined}
      className="aspect-video w-full rounded-md bg-black"
    />
  );
}
