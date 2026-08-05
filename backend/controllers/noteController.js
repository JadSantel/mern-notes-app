import Note from "../models/Note.js";

function normalizeTags(tags) {
    if (!Array.isArray(tags)) return [];

    return [...new Set(
        tags
            .filter((tag) => typeof tag === "string")
            .map((tag) => tag.trim())
            .filter(Boolean)
    )];
}

export const getNotes = async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).sort({updatedAt: -1});
    res.json(notes);
};

export const getNoteById = async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
};

export const createNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });
        const note = await Note.create({
            title,
            content,
            tags: normalizeTags(tags),
            user: req.user._id,
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: "Server error creating note" });
    } 
};

export const updateNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const fields = {};
        if (title !== undefined) fields.title = title;
        if (content !== undefined) fields.content = content;
        if (tags !== undefined) fields.tags = normalizeTags(tags);

        const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        fields,
        { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Server error updating note" });
    }
};

export const deleteNote = async (req, res) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id});
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted", id: req.params.id });
};

