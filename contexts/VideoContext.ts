"use client";

import { createContext, useContext } from "react";

export interface VideoFile {
  file: File;
  id: string | null;
}

interface VideoContextType {
  selectedVideo: File | null;
  setSelectedVideo: (video: File | null) => void;
  videoId: string | null;
  setVideoId: (id: string | null) => void;
  pendingVideos: VideoFile[];
  setPendingVideos: (videos: VideoFile[]) => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
}

export const VideoContext = createContext<VideoContextType | null>(null);

export function useVideo(): VideoContextType {
  const context = useContext(VideoContext);
  if (context === null || context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}