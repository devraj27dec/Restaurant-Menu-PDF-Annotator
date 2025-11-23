import { prisma } from "./prisma.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
export async function ExtractMenuItems(menuId) {
    const annotations = await prisma.annotation.findMany({
        where: { menuId },
        orderBy: [{ pageNumber: "asc" }, { id: "asc" }],
    });
    if (!annotations.length)
        return [];
    const grouped = new Map();
    for (const a of annotations) {
        const groupKey = a.groupId ?? `ungrouped-${a.id}`;
        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, []);
        }
        grouped.get(groupKey).push(a);
    }
    const menuItems = [];
    for (const [groupId, group] of grouped.entries()) {
        const items = group.filter(a => a.type === 'item');
        const prices = group.filter(a => a.type === 'price');
        const descriptions = group.filter(a => a.type === 'description');
        const category = group.find(a => a.type === 'category')?.text || '';
        for (let i = 0; i < items.length; i++) {
            const itemObj = {
                groupId,
                category,
                name: items[i]?.text || '',
                price: prices[i]?.text || '',
                description: descriptions[i]?.text || ''
            };
            if (itemObj.name) {
                menuItems.push(itemObj);
            }
        }
    }
    return menuItems;
}
//# sourceMappingURL=services.js.map