import z from 'zod';
export declare const AnnotationSchema: z.ZodObject<{
    pageNumber: z.ZodNumber;
    boundingBox: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.z.core.$strip>;
    text: z.ZodString;
    type: z.ZodEnum<{
        item: "item";
        price: "price";
        description: "description";
        category: "category";
    }>;
    groupId: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map