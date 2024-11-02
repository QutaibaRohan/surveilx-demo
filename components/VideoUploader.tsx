"use client";

import { useState } from "react";
import { useVideo } from "@/contexts/VideoContext";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoUploader() {
  const {
    pendingVideos,
    setPendingVideos,
    setSelectedVideo,
    setCurrentVideoIndex,
  } = useVideo();

  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("video/")
    );

    if (files.length > 0) {
      const videoFiles = files.map((file) => ({ file, id: null }));
      setPendingVideos([...pendingVideos, ...videoFiles]);

      // Only set selected video if none is currently selected
      if (!pendingVideos.length) {
        setSelectedVideo(files[0]);
        setCurrentVideoIndex(0);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("video/")
    );

    if (files.length > 0) {
      const videoFiles = files.map((file) => ({ file, id: null }));
      setPendingVideos([...pendingVideos, ...videoFiles]);

      // Only set selected video if none is currently selected
      if (!pendingVideos.length) {
        setSelectedVideo(files[0]);
        setCurrentVideoIndex(0);
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4 transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-muted"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload
        className={cn(
          "w-8 h-8 text-muted-foreground",
          isDragging && "text-primary"
        )}
      />
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-muted-foreground">
          Supported format: mp4, mpeg
        </p>
        <p className="text-xs text-muted-foreground">OR</p>
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-sm text-primary hover:underline"
        >
          Browse files
        </label>
      </div>
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
