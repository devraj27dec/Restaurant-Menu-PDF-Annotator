import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
import MenuRouter from './routes/menu.route.js';
import cors from 'cors';
app.use(cors({
    origin: ["http://localhost:5173", "https://menu-pdf-annotator.vercel.app"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use('/api/menus', MenuRouter);
app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map