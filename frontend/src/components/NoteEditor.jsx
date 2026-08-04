import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AUTOSAVE_DELAY_MS = 800;

export default function NoteEditor({ note, onUpdate }) {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || "");
    const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"

    // Reset local state whenever a DIFFERENT note is selected
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content || "");
        setSaveStatus("saved");
    }, [note._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveTimer = useRef(null);

    useEffect(() => {
        if (title === note.title && content === note.content) return;

        setSaveStatus("saving");
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            try {
                await onUpdate(note._id, { title, content });
                setSaveStatus("saved");
            } catch (err) {
                setSaveStatus("error");
                toast.error(err.response?.data?.message || "Failed to save note");
            }
        }, AUTOSAVE_DELAY_MS);

        return () => clearTimeout(saveTimer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, content]);

    return (
        <div className="flex h-full flex-1 flex-col bg-light-bg dark:bg-dark-bg">
            <div className="border-b border-light-border dark:border-dark-border p-8 pb-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled"
                        className="w-full bg-transparent text-xl font-bold text-light-text dark:text-dark-text placeholder:text-light-text-secondary focus:outline-none"
                    />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={saveStatus}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="shrink-0 text-xs font-medium uppercase tracking-wide text-light-text-secondary"
                        >
                            {saveStatus === "saving" && "Saving…"}
                            {saveStatus === "saved" && "Saved ✓"}
                            {saveStatus === "error" && "Failed to save"}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <p className="text-xs uppercase tracking-wide text-light-text-secondary">
                    Last edited {new Date(note.updatedAt).toLocaleString()}
                </p>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="flex-1 resize-none bg-transparent p-8 font-mono text-sm leading-relaxed text-light-text dark:text-dark-text placeholder:text-light-text-secondary focus:outline-none"
            />
        </div>
    );
}