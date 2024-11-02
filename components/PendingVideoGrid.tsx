import { PendingVideoGridProps } from "@/interfaces/annotations.interface";
import { Play, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useVideo } from "@/contexts/VideoContext";

export function PendingVideoGrid({
  pendingVideos,
  currentVideoIndex,
  onSelectVideo,
}: PendingVideoGridProps) {
  const { setPendingVideos, setSelectedVideo, setCurrentVideoIndex } =
    useVideo();

  const handleRemoveVideo = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPendingVideos = pendingVideos.filter((_, i) => i !== index);
    setPendingVideos(newPendingVideos);

    // Handle selected video when removing
    if (newPendingVideos.length === 0) {
      setSelectedVideo(null);
      setCurrentVideoIndex(0);
    } else if (index === currentVideoIndex) {
      // If removing current video, select the next one or the last one
      const nextIndex = Math.min(
        currentVideoIndex,
        newPendingVideos.length - 1
      );
      setSelectedVideo(newPendingVideos[nextIndex].file);
      setCurrentVideoIndex(nextIndex);
    } else if (index < currentVideoIndex) {
      // If removing a video before the current one, adjust the index
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {pendingVideos.map((video, index) => (
        <div
          key={index}
          onClick={() => onSelectVideo(index)}
          className={cn(
            "aspect-video bg-muted rounded-sm overflow-hidden relative cursor-pointer group",
            index === currentVideoIndex && "ring-2 ring-primary"
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <video
            src={URL.createObjectURL(video.file)}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => handleRemoveVideo(index, e)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
