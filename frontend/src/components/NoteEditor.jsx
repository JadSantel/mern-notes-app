import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import TagChip from "./TagChip";

const AUTOSAVE_DELAY_MS = 800;

function areArraysEqual(a = [], b = []) {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
}

export default function NoteEditor({ note, onUpdate, onDelete }) {
    const [tags, setTags] = useState(note.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [showTagInput, setShowTagInput] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || "");
    const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDeleteConfirmed = async () => {
        try {
            await onDelete(note._id);
            toast.success("Note deleted");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete note");
        } finally {
            setConfirmOpen(false);
        }
    };

    const handleAddTag = () => {
        const newTag = tagInput.trim().replace(/,$/, "");
        const tagExists = tags.some((tag) => tag.toLowerCase() === newTag.toLowerCase());

        if (!newTag || tagExists) {
            setTagInput("");
            return;
        }

        setTags((prevTags) => [...prevTags, newTag]);
        setTagInput("");
        setShowTagInput(false);
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
    };

    // Reset local state whenever a DIFFERENT note is selected
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content || "");
        setTags(note.tags || []);
        setTagInput("");
        setShowTagInput(false);
        setSaveStatus("saved");
    }, [note._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveTimer = useRef(null);

    useEffect(() => {
        if (
            title === note.title &&
            content === note.content &&
            areArraysEqual(tags, note.tags)
        ) {
            return;
        }

        setSaveStatus("saving");
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            try {
                await onUpdate(note._id, { title, content, tags });
                setSaveStatus("saved");
            } catch (err) {
                setSaveStatus("error");
                toast.error(err.response?.data?.message || "Failed to save note");
            }
        }, AUTOSAVE_DELAY_MS);

        return () => clearTimeout(saveTimer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, content, tags]);
    /* eslint-enable react-hooks/set-state-in-effect */

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
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        aria-label="Delete note"
                        className="text-light-text-secondary hover:text-danger"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
                <p className="text-xs uppercase tracking-wide text-light-text-secondary">
                    Last edited {new Date(note.updatedAt).toLocaleString()}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                        <TagChip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowTagInput((value) => !value)}
                        className="inline-flex items-center gap-1 rounded-full border border-light-border bg-light-surface px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-light-text-secondary transition hover:border-accent-orange hover:text-accent-orange dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-secondary"
                    >
                        <Plus size={12} />
                        Add tag
                    </button>
                </div>
                {showTagInput && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            autoFocus
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            placeholder="New tag"
                            className="min-w-[180px] flex-1 rounded-lg border border-light-border bg-transparent px-3 py-2 text-sm text-light-text dark:border-dark-border dark:text-dark-text focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="rounded-lg bg-accent-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-accent-orange/90"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTagInput("");
                                setShowTagInput(false);
                            }}
                            className="rounded-lg border border-light-border bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-light-text-secondary transition hover:border-accent-orange hover:text-accent-orange dark:border-dark-border"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="flex-1 resize-none bg-transparent p-8 font-mono text-sm leading-relaxed text-light-text dark:text-dark-text placeholder:text-light-text-secondary focus:outline-none"
            />
            <ConfirmModal
                isOpen={confirmOpen}
                title="Delete this note?"
                description="This can't be undone."
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
