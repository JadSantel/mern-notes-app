import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.json({message: "MERN notes API is running"});
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});