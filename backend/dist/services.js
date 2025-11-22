import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist";
import { prisma } from "./prisma.js";
export async function extractAnnotations(menuId) {
    const menu = await prisma.menu.findUnique({
        where: { id: menuId }
    });
    if (!menu)
        throw new Error("Menu not found");
    const filePath = path.join("uploads", menu.filename);
    if (!fs.existsSync(filePath)) {
        throw new Error("File not found: " + filePath);
    }
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    const pdf = await getDocument({
        data: uint8Array,
        isEvalSupported: false,
        useSystemFonts: true
    }).promise;
    const annotations = [];
    let counter = 1;
    let currentGroupId = null;
    let categoryCounter = 1;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        for (const item of content.items) {
            const text = item.str.trim();
            if (!text)
                continue;
            const transform = item.transform || [1, 0, 0, 1, 0, 0];
            const x = transform[4] ?? 0;
            const y = transform[5] ?? 0;
            const width = item.width ?? text.length * 8;
            const height = transform[0] ?? 10;
            const type = detectLabel(text);
            if (type === "category") {
                // Assign new group ID when category found
                currentGroupId = `group-${categoryCounter++}`;
            }
            const splitParts = splitMenuLine(text);
            for (const part of splitParts) {
                annotations.push({
                    id: `ann-${counter++}`,
                    menuId,
                    pageNumber,
                    boundingBox: { x, y, width, height },
                    text: part.text,
                    type: part.type,
                    groupId: currentGroupId
                });
            }
        }
    }
    return annotations;
}
function splitMenuLine(text) {
    const priceRegex = /\$?\d+(\.\d{2})?\b/;
    const priceMatch = text.match(priceRegex);
    if (!priceMatch)
        return [{ text, type: detectLabel(text) }];
    const price = priceMatch[0];
    const rest = text.replace(price, "")
        .replace(/\.+/g, "")
        .trim();
    return [
        { text: rest, type: "item" },
        { text: price, type: "price" }
    ];
}
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
        const itemObj = { groupId };
        for (const ann of group) {
            switch (ann.type) {
                case "item":
                    itemObj.name = ann.text;
                    break;
                case "price":
                    itemObj.price = ann.text;
                    break;
                case "description":
                    itemObj.description = ann.text;
                    break;
                case "category":
                    itemObj.category = ann.text;
            }
        }
        if (itemObj.name) {
            menuItems.push(itemObj);
        }
    }
    return menuItems;
}
function detectLabel(text) {
    if (/^\$?\d+(\.\d{2})?$/.test(text))
        return "price";
    if (text.length > 20)
        return "description";
    if (/APPETIZERS|ENTREES|DRINKS|DESSERTS/i.test(text))
        return "category";
    return "item";
}
//# sourceMappingURL=services.js.map