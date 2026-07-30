import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js"

dotenv.config();
connectDB();

const app = express();

app.get("/", (req, res) => {
    res.json({message: "MERN notes API is running"});
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use(express.json());
app.use("/api/notes", noteRoutes);