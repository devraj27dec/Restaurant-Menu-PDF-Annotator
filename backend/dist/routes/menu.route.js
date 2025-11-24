import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { prisma } from "../prisma.js";
import path from 'path';
import fs from 'fs';
import { ExtractMenuItems } from "../services.js";
const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const MAX_SIZE = 5 * 1024 * 1024;
const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE }
});
router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
    }
    try {
        const filePath = path.join("uploads", req.file.filename);
        const buffer = fs.readFileSync(filePath);
        const uint8Data = new Uint8Array(buffer);
        const pdfData = new PDFParse(uint8Data);
        const text = (await pdfData.getText()).text;
        const metadata = (await pdfData.getInfo()).metadata;
        console.log("Extracted text:", text);
        const createdMenu = await prisma.menu.create({
            data: {
                filename: req.file.originalname,
                uploadDate: new Date(),
                status: "uploaded"
            }
        });
        res.status(201).json({
            id: createdMenu.id,
            message: "File stored and PDF parsed successfully!",
            extractedText: text,
            metadata
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "PDF processing failed" });
    }
});
router.post("/:menuId/annotations", async (req, res) => {
    try {
        const { menuId } = req.params;
        const { annotations } = req.body;
        console.log("annotaions", annotations);
        if (!annotations || !Array.isArray(annotations)) {
            return res.status(400).json({ error: "Invalid annotations format" });
        }
        await prisma.annotation.createMany({
            data: annotations.map(a => ({
                menuId,
                pageNumber: a.pageNumber,
                boundingBox: a.boundingBox,
                text: a.text,
                type: a.type,
                groupId: String(a.groupId)
            })),
        });
        return res.json({ success: true, count: annotations.length });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
router.delete('/:id/annotations', async (req, res) => {
    const menuId = req.params.id;
    if (!menuId) {
        return res.status(400).send("Menu Not Found");
    }
    const result = await prisma.annotation.deleteMany({
        where: {
            menuId: menuId ?? ""
        }
    });
    return res.status(200).send(`Deleted ${result.count} annotation(s) successfully`);
});
router.get('/:id/annotations', async (req, res) => {
    const menuId = req.params.id;
    const annotaions = await prisma.annotation.findMany({
        where: {
            menuId: menuId ?? ""
        }
    });
    return res.status(201).json(annotaions);
});
router.post('/:id/extract', async (req, res) => {
    const menuId = req.params.id;
    const annotation = await prisma.annotation.findFirst({ where: { menuId: menuId ?? "" } });
    try {
        const menuItems = await ExtractMenuItems(menuId);
        await Promise.all(menuItems.map(async (item) => {
            console.log("items", item);
            await prisma.menuItem.create({
                data: {
                    menuId: menuId ?? "",
                    annotationId: annotation?.id ?? "",
                    name: item.name,
                    description: item.description ?? "",
                    price: item.price ? parseFloat(item.price.split("$")[1] ?? "0") : 0,
                    category: item.category ?? "Uncategorized",
                }
            });
        }));
        await prisma.menu.update({
            data: { status: "extracted" },
            where: { id: menuId ?? "" },
        });
        return res.status(201).json({ success: true, created: menuItems.length });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});
router.get('/:id/items', async (req, res) => {
    const menuId = req.params.id;
    const menuItems = await prisma.menuItem.findMany({
        where: { menuId: menuId ?? "" }
    });
    return res.status(201).json(menuItems);
});
router.get('/all', async (req, res) => {
    try {
        const menuList = await prisma.menuItem.findMany();
        return res.status(200).json(menuList);
    }
    catch (error) {
        console.error('Error fetching menu items:', error);
        return res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});
export default router;
//# sourceMappingURL=menu.route.js.map