import z from 'zod';
export declare const MenuSchema: z.ZodObject<{
    filename: z.ZodString;
    status: z.ZodString;
}, z.z.core.$strip>;
export declare const MenuItemSchema: z.ZodObject<{
    menuId: z.ZodString;
    category: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
}, z.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map