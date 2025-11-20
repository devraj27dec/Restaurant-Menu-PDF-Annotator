import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    res.send("Hello Welcome to Backend of Pdf Anotation App ");
});
app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map