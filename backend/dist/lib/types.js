import z from 'zod';
export const MenuSchema = z.object({
    filename: z.string(),
    status: z.string()
});
export const MenuItemSchema = z.object({
    menuId: z.string(),
    category: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number()
});
//# sourceMappingURL=types.js.map