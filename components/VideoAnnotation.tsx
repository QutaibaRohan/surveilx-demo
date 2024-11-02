"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/contexts/VideoContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Play } from "lucide-react";
import { uploadToS3 } from "@/utils/aws/s3.utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const annotationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  tags: z.array(z.string()),
});

type AnnotationForm = z.infer<typeof annotationSchema>;

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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<AnnotationForm>({
    resolver: zodResolver(annotationSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const newTag = target.value.trim();

      if (newTag) {
        const currentTags = form.getValues("tags");
        if (!currentTags.includes(newTag)) {
          form.setValue("tags", [...currentTags, newTag]);
        }
        target.value = ""; // Clear input directly
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(pendingVideos[index].file);
    setVideoId(pendingVideos[index].id);
  };

  const handleSave = async (formData: AnnotationForm) => {
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
            title: formData.title,
            description: formData.description,
            tags: formData.tags,
          },
        ]);

      if (annotationError) throw annotationError;

      // 5. Remove current video from pending videos
      const newPendingVideos = pendingVideos.filter(
        (_, index) => index !== currentVideoIndex
      );
      setPendingVideos(newPendingVideos);

      // 6. Reset form
      form.reset();

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
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
        <Input
          {...form.register("title")}
          placeholder="Title"
          className="bg-secondary/50"
        />
        {form.formState.errors.title && (
          <span className="text-sm text-red-500">
            {form.formState.errors.title.message}
          </span>
        )}

        <Textarea
          {...form.register("description")}
          placeholder="Description"
          rows={4}
          className="bg-secondary/50"
        />

        <div className="space-y-2">
          <Input
            onKeyDown={handleAddTag}
            placeholder="Give a tag (press Enter to add)"
            className="bg-secondary/50"
          />
          <div className="flex flex-wrap gap-2">
            {form.watch("tags").map((tag) => (
              <span
                key={tag}
                className="bg-secondary px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
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
      </form>
    </div>
  );
}
