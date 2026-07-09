"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seekMediaElement } from "@/components/content/media-player-utils";

export function useMediaPlayback<T extends HTMLMediaElement = HTMLMediaElement>(
  mediaSrc: string,
) {
  const mediaRef = useRef<T | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) {
      return;
    }

    const onTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(media.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(media.duration);
    const onEnded = () => setIsPlaying(false);

    media.addEventListener("timeupdate", onTimeUpdate);
    media.addEventListener("loadedmetadata", onLoadedMetadata);
    media.addEventListener("ended", onEnded);

    return () => {
      media.removeEventListener("timeupdate", onTimeUpdate);
      media.removeEventListener("loadedmetadata", onLoadedMetadata);
      media.removeEventListener("ended", onEnded);
    };
  }, [isSeeking, mediaSrc]);

  const togglePlayback = useCallback(async () => {
    const media = mediaRef.current;
    if (!media) {
      return;
    }

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await media.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const beginSeek = useCallback(() => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  }, [currentTime]);

  const seekTo = useCallback(
    (value: number) => {
      const media = mediaRef.current;
      if (!media) {
        return;
      }

      const nextTime = seekMediaElement(media, value, duration);
      setSeekValue(nextTime);
      setCurrentTime(nextTime);
    },
    [duration],
  );

  const endSeek = useCallback(() => {
    setIsSeeking(false);
  }, []);

  const displayedTime = isSeeking ? seekValue : currentTime;
  const progress = duration > 0 ? (displayedTime / duration) * 100 : 0;

  return {
    mediaRef,
    isPlaying,
    duration,
    displayedTime,
    progress,
    togglePlayback,
    beginSeek,
    seekTo,
    endSeek,
  };
}
