import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true, 
            trim: true 
        },
        tags: {
            type: [{ type: String, trim: true }],
            default: [],
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
