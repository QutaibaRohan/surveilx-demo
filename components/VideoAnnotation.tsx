"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { uploadToS3 } from "@/utils/aws/s3.utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoPlayer } from "./VideoPlayer";
import { PendingVideoGrid } from "./PendingVideoGrid";
import { AnnotationForm as AnnotationFormComponent } from "./AnnotationForm";
import { AnnotationForm } from "@/interfaces/annotations.interface";
import { annotationSchema } from "@/schemas/annotation.schema";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useVideo } from "@/contexts/video.context";

export default function VideoAnnotation() {
  const {
    selectedVideo,
    pendingVideos,
    currentVideoIndex,
    setPendingVideos,
    setSelectedVideo,
    setVideoId,
    setCurrentVideoIndex,
  } = useVideo();

  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<AnnotationForm>({
    resolver: zodResolver(annotationSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(pendingVideos[index].file);
    setVideoId(pendingVideos[index].id);
  };

  const uploadMutation = useMutation({
    mutationKey: ["upload"],
    mutationFn: async (formData: AnnotationForm) => {
      if (!selectedVideo) return;
      const supabase = createClient();

      const fileExt = selectedVideo.name.split(".").pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const s3Url = await uploadToS3(selectedVideo, uniqueFileName);

      const { data: videoData, error: videoError } = await supabase
        .from("Videos")
        .insert([{ file_name: selectedVideo.name, aws_path: s3Url }])
        .select()
        .single();

      if (videoError) throw videoError;

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

      return videoData;
    },
    onSuccess: () => {
      toast.success("Video uploaded and annotated successfully!");
      handleSuccessfulSave();
    },
    onError: (error) => {
      console.error("Error saving:", error);
      toast.error("Failed to upload video. Please try again.");
    },
  });

  const handleSave = async (formData: AnnotationForm) => {
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccessfulSave = () => {
    const newPendingVideos = pendingVideos.filter(
      (_, index) => index !== currentVideoIndex
    );
    setPendingVideos(newPendingVideos);
    form.reset();

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
  };

  return (
    <div className="space-y-6">
      {/* <h2 className="text-xl font-semibold">
        Record - {new Date().toLocaleDateString()} -{" "}
        {new Date().toLocaleTimeString()}
      </h2> */}
      <div className="space-y-4">
        <VideoPlayer videoRef={videoRef} selectedVideo={selectedVideo} />

        <PendingVideoGrid
          pendingVideos={pendingVideos}
          currentVideoIndex={currentVideoIndex}
          onSelectVideo={handleSelectVideo}
        />
      </div>

      <AnnotationFormComponent
        form={form}
        isUploading={isUploading}
        //uploadProgress={uploadProgress}
        selectedVideo={selectedVideo}
        onSubmit={handleSave}
      />
    </div>
  );
}
