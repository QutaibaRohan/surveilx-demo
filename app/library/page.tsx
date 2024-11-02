"use client";

import VideoUploader from "@/components/VideoUploader";
import VideoAnnotation from "@/components/VideoAnnotation";
import { VideoContext, VideoFile } from "@/contexts/VideoContext";
import { useState } from "react";

export default function LibraryPage() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [pendingVideos, setPendingVideos] = useState<VideoFile[]>([]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  return (
    <VideoContext.Provider
      value={{
        selectedVideo,
        setSelectedVideo,
        videoId,
        setVideoId,
        pendingVideos,
        setPendingVideos,
        currentVideoIndex,
        setCurrentVideoIndex,
      }}
    >
      <div className="space-y-8">
        <div
          className={`grid grid-cols-1 ${selectedVideo ? "lg:grid-cols-2" : ""} gap-8`}
        >
          {selectedVideo && <VideoAnnotation />}
          <VideoUploader />
        </div>
      </div>
    </VideoContext.Provider>
  );
}
