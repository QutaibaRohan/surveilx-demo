import { VideoFile } from "@/contexts/video.context";
import { annotationSchema } from "@/schemas/annotation.schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export interface Annotation {
  id: string;
  video_id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}



export type AnnotationForm = z.infer<typeof annotationSchema>;

export interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  selectedVideo: File | null;
}

export interface PendingVideoGridProps {
  pendingVideos: VideoFile[];
  currentVideoIndex: number;
  onSelectVideo: (index: number) => void;
}

export interface AnnotationFormProps {
  form: UseFormReturn<AnnotationForm>;
  isUploading: boolean;
  //uploadProgress: number;
  selectedVideo: File | null;
  onSubmit: (data: AnnotationForm) => Promise<void>;
}