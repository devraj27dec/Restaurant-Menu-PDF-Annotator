import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { prisma } from "../prisma.js";
import { ExtractMenuItems } from "../services.js";
const router = express.Router();
const storage = multer.memoryStorage();
const MAX_SIZE = 5 * 1024 * 1024;
const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    },
});
router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
    }
    try {
        // const filePath = path.join("uploads", req.file.filename);
        // const buffer = fs.readFileSync(filePath);
        // const uint8Data = new Uint8Array(buffer);
        const uint8Data = new Uint8Array(req.file.buffer);
        const pdfData = new PDFParse(uint8Data);
        const text = (await pdfData.getText()).text;
        const metadata = (await pdfData.getInfo()).metadata;
        // console.log("Extracted text:", text);
        const createdMenu = await prisma.menu.create({
            data: {
                filename: req.file.originalname,
                uploadDate: new Date(),
                status: "uploaded",
            },
        });
        res.status(201).json({
            id: createdMenu.id,
            message: "File stored and PDF parsed successfully!",
            extractedText: text,
            metadata,
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
        if (!menuId) {
            return res.status(400).json({ error: "Menu ID is required" });
        }
        if (!annotations || !Array.isArray(annotations)) {
            return res.status(400).json({ error: "Invalid annotations format" });
        }
        await prisma.annotation.createMany({
            data: annotations.map((a) => ({
                menuId,
                pageNumber: a.pageNumber,
                boundingBox: a.boundingBox,
                text: a.text,
                type: a.type,
                groupId: String(a.groupId),
            })),
        });
        await prisma.menu.update({
            data: { status: "annotated" },
            where: { id: menuId ?? "" },
        });
        return res.json({ success: true, count: annotations.length });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
router.patch('/annotations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!id) {
            return res.status(400).json("AnnotationId is Required");
        }
        const updated = await prisma.annotation.update({
            where: { id },
            data: updates
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: 'Failed to update annotation' });
    }
});
router.delete("/:id/annotations", async (req, res) => {
    try {
        const annId = req.params.id;
        if (!annId) {
            return res.status(400).json({ error: "Annotation is Required" });
        }
        await prisma.annotation.delete({
            where: { id: annId }
        });
        return res.status(200).json({ message: 'Deleted successfully' });
    }
    catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Failed to delete annotation' });
    }
});
router.get("/:id/annotations", async (req, res) => {
    const menuId = req.params.id;
    if (!menuId) {
        return res.status(400).json({ error: "Menu ID is required" });
    }
    const annotaions = await prisma.annotation.findMany({
        where: {
            menuId,
        },
    });
    return res.status(201).json(annotaions);
});
router.post("/:id/extract", async (req, res) => {
    const menuId = req.params.id;
    if (!menuId) {
        return res.status(400).json({ error: "Menu ID is required" });
    }
    const annotation = await prisma.annotation.findFirst({
        where: { menuId: menuId ?? "" },
    });
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
                },
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
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/:id/items", async (req, res) => {
    const menuId = req.params.id;
    if (!menuId) {
        return res.status(400).json({ error: "Menu ID is required" });
    }
    const menuItems = await prisma.menuItem.findMany({
        where: { menuId: menuId ?? "" },
    });
    return res.status(201).json(menuItems);
});
router.get("/items", async (req, res) => {
    try {
        const menuList = await prisma.menu.findMany({
            include: {
                menuItems: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        category: true,
                        description: true
                    }
                }
            }
        });
        return res.status(200).json(menuList);
    }
    catch (error) {
        console.error("Error fetching menu items:", error);
        return res.status(500).json({ error: "Failed to fetch menu items" });
    }
});
export default router;
//# sourceMappingURL=menu.route.js.map