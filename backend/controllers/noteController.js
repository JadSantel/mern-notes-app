import Note from "../models/Note.js";

export const getNotes = async (req, res) => {
    const notes = await Note.find().sort({updatedAt: -1});
    res.json(notes);
};

export const createNote = async (req, res) => {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
};

