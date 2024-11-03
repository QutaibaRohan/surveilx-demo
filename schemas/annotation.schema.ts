import * as z from "zod";

export const annotationSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});