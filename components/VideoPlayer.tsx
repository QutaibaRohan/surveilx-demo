"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

export default function VideoPlayer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!selectedVideo) return;

    const supabase = createClient();

    // Upload video to S3 (we'll implement this later)
    // Save metadata to Supabase
    const { data, error } = await supabase
      .from("videos")
      .insert([
        {
          title,
          description,
          tags,
          aws_path: "", // We'll update this after S3 implementation
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving video:", error);
      return;
    }

    // Reset form
    setTitle("");
    setDescription("");
    setTags([]);
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {selectedVideo ? selectedVideo.name : "No video selected"}
      </h2>

      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        {/* Video player will go here */}
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="space-y-2">
          <Input
            placeholder="Add tags (press Enter)"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
          />

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
