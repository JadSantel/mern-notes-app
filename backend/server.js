import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

app.use(cors());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: "MERN notes API is running"});
});

app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



