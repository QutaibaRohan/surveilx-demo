"use client";

import { Video } from "@/interfaces/video.interface";

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="aspect-video bg-muted rounded cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            // We'll implement video selection logic
            console.log("Selected video:", video);
          }}
        >
          <video
            src={video.aws_path}
            className="w-full h-full object-cover"
            poster="/video-placeholder.png"
          />
        </div>
      ))}
    </div>
  );
}
