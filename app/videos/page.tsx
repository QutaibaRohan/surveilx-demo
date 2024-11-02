import { Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listVideos } from "@/utils/aws/s3.utils";

export default async function VideosPage() {
  const videos = await listVideos();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Videos</h1>
      </div>

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
                // onLoadedData={(e) => {
                //   const video = e.target as HTMLVideoElement;
                //   video.currentTime = 1; // Skip to 1 second to avoid black frame
                // }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div>
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

              <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                <a
                  href={video.aws_path}
                  download
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