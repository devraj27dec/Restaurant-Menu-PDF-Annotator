import z from 'zod'


export const AnnotationSchema = z.object({
  pageNumber: z.number().int().min(1),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  text: z.string().min(1),
  type: z.enum(["category", "item", "price", "description"]),
  groupId: z.string(),
});