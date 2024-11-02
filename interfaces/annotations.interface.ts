export interface Annotation {
  id: string;
  video_id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}