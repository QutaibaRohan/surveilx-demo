import { VideoPlayerProps } from "@/interfaces/annotations.interface";

export function VideoPlayer({ videoRef, selectedVideo }: VideoPlayerProps) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={selectedVideo ? URL.createObjectURL(selectedVideo) : undefined}
        className="w-full h-full object-contain"
        controls
        autoPlay
      />
    </div>
  );
}
