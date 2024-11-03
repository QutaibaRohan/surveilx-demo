import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnnotationFormProps } from "@/interfaces/annotations.interface";
import { UploadProgress } from "./UploadProgress";

export function AnnotationForm({
  form,
  isUploading,
  //uploadProgress,
  selectedVideo,
  onSubmit,
}: AnnotationFormProps) {
  const [tagInput, setTagInput] = useState("");

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      const currentTags = form.getValues("tags") || [];

      if (newTag && !currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag], { shouldDirty: true });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
      { shouldDirty: true }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...form.register("title")}
        placeholder="Title"
        className="bg-secondary/50"
        disabled={isUploading}
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
        disabled={isUploading}
      />

      <div className="space-y-2">
        <Input
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleAddTag}
          placeholder="Give a tag (press enter to add)"
          className="bg-secondary/50"
          disabled={isUploading}
        />
        <div className="flex flex-wrap gap-2">
          {form.getValues("tags")?.map((tag) => (
            <span
              key={tag}
              className="bg-secondary px-2 py-1 rounded text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-xs hover:text-red-500"
                disabled={isUploading}
                aria-label={`Remove ${tag} tag`}
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
        {isUploading ? <UploadProgress /> : "SAVE"}
      </Button>
    </form>
  );
}
