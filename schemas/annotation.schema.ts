import * as z from "zod";

export const annotationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  tags: z.array(z.string()),
});