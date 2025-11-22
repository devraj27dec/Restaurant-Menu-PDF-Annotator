import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { prisma } from "../prisma.js";
import path from 'path';
import fs from 'fs';
import { extractAnnotations, ExtractMenuItems } from "../services.js";
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
        await prisma.menu.create({
            data: {
                filename: req.file.originalname,
                uploadDate: new Date(),
                status: "uploaded"
            }
        });
        res.status(201).json({
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
router.post("/:id/annotations", async (req, res) => {
    const menuId = req.params.id;
    const annotations = await extractAnnotations(menuId);
    try {
        const saved = await prisma.annotation.createMany({
            data: annotations.map(a => ({
                menuId,
                pageNumber: a.pageNumber,
                boundingBox: a.boundingBox,
                text: a.text,
                type: a.type,
                groupId: a.groupId
            }))
        });
        res.status(201).json({
            message: "Annotations saved successfully",
            count: saved.count
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save annotations" });
    }
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
        // console.log("menuItem" , menuItems)
        await Promise.all(menuItems.map(async (item) => {
            console.log("items", item);
            await prisma.menuItem.create({
                data: {
                    menuId,
                    annotationId: annotation?.id,
                    name: item.name,
                    description: item.description ?? "",
                    price: item.price ? parseFloat(item.price.split("$")[1] ?? "0") : 0,
                    category: item.category ?? "Uncategorized",
                }
            });
        }));
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
// router.get("/:menuId", async (req: Request, res: Response) => {
//   try {
//     const { menuId } = req.params;
//     if (!menuId) {
//       return res.status(400).json({ message: "Menu ID is required" });
//     }
//     const data = await extractAnnotations(menuId);
//     console.log("Extracted Data:", data);
//     return res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to extract annotations" });
//   }
// });
export default router;
//# sourceMappingURL=menu.route.js.map