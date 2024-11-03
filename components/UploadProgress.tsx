import { Loader2 } from "lucide-react";

export const UploadProgress = ({ progress }: { progress: number }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    {Math.round(progress)}%
  </div>
);
