"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/contexts/VideoContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Play } from "lucide-react";
import { uploadToS3 } from "@/utils/aws/s3.utils";

export default function VideoAnnotation() {
  const {
    selectedVideo,
    videoId,
    pendingVideos,
    currentVideoIndex,
    setPendingVideos,
    setSelectedVideo,
    setVideoId,
    setCurrentVideoIndex,
  } = useVideo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(pendingVideos[index].file);
    setVideoId(pendingVideos[index].id);
  };

  const handleSave = async () => {
    if (!selectedVideo) return;
    const supabase = createClient();

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Generate a unique filename
      const fileExt = selectedVideo.name.split(".").pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 2. Upload to S3 directly with progress callback
      const s3Url = await uploadToS3(
        selectedVideo,
        uniqueFileName,
        (progress) => setUploadProgress(progress)
      );

      // 3. Create video record with S3 URL
      const { data: videoData, error: videoError } = await supabase
        .from("Videos")
        .insert([
          {
            file_name: selectedVideo.name,
            aws_path: s3Url,
          },
        ])
        .select()
        .single();

      if (videoError) throw videoError;

      // 4. Create annotation record
      const { error: annotationError } = await supabase
        .from("Annotations")
        .insert([
          {
            video_id: videoData.id,
            title,
            description,
            tags,
          },
        ]);

      if (annotationError) throw annotationError;

      // 5. Remove current video from pending videos
      const newPendingVideos = pendingVideos.filter(
        (_, index) => index !== currentVideoIndex
      );
      setPendingVideos(newPendingVideos);

      // 6. Reset form
      setTitle("");
      setDescription("");
      setTags([]);

      // 7. Set next video if available
      if (newPendingVideos.length > 0) {
        const nextIndex = Math.min(
          currentVideoIndex,
          newPendingVideos.length - 1
        );
        setCurrentVideoIndex(nextIndex);
        setSelectedVideo(newPendingVideos[nextIndex].file);
        setVideoId(newPendingVideos[nextIndex].id);
      } else {
        setSelectedVideo(null);
        setVideoId(null);
        setCurrentVideoIndex(0);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Record - {new Date().toLocaleDateString()} -{" "}
        {new Date().toLocaleTimeString()}
      </h2>

      {/* Video Player */}
      <div className="space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={selectedVideo ? URL.createObjectURL(selectedVideo) : undefined}
            className="w-full h-full object-contain"
            controls
          />
        </div>

        {/* Pending Videos */}
        <div className="grid grid-cols-5 gap-4">
          {pendingVideos.map((video, index) => (
            <div
              key={index}
              onClick={() => handleSelectVideo(index)}
              className={`aspect-video bg-muted rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity
                ${index === currentVideoIndex ? "ring-2 ring-primary" : ""}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <video
                src={URL.createObjectURL(video.file)}
                className="w-full h-full object-cover opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-secondary/50"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
          className="bg-secondary/50"
        />

        <div className="space-y-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Give a tag"
            className="bg-secondary/50"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary px-2 py-1 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isUploading || !selectedVideo}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress < 100
                ? `Uploading... ${uploadProgress}%`
                : "Processing..."}
            </div>
          ) : (
            "SAVE"
          )}
        </Button>
      </div>
    </div>
  );
}
