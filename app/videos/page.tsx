"use client";

import { Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { listVideos } from "@/utils/aws/s3.utils";

export default function VideosPage() {
  const { data: videos } = useQuery({
    queryKey: ["videos"],
    queryFn: listVideos,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video) => (
          <div
            key={video.id}
            className="group relative bg-card rounded-lg overflow-hidden shadow-sm border"
          >
            <div className="aspect-video relative">
              <video
                src={video.aws_path}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
                autoPlay
                loop
              />
              {/* <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    const video = e.currentTarget.parentElement
                      ?.previousElementSibling as HTMLVideoElement;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div> */}
            </div>

            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium truncate">
                  {video.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video.created_at
                    ? new Date(video.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>

              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                asChild
              >
                <a
                  href={video.aws_path}
                  download={video.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {videos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos found</p>
        </div>
      )}
    </div>
  );
}
