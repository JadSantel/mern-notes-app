import Note from "../models/Note.js";

export const getNotes = async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).sort({updatedAt: -1});
    res.json(notes);
};

export const getNoteById = async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(401).json({ message: "Note not found" });
    res.status(201).json(note);
};

export const createNote = async (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const note = await Note.create({ title, content, user: req.user._id });
    res.status(201).json(note);
};

export const updateNote = async (req, res) => {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { title, content },
        { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
};

export const deleteNote = async (req, res) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id});
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted", id: req.params.id });
};

