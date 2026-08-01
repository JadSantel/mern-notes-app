import { Type } from "lucide-react";
import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true, 
            trim: true 
        },
        content: { 
            type: String, 
            default: "" 
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;