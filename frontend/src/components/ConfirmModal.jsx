import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({ isOpen, title, description, onConfirm, onCancel }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-sm rounded-2xl border border-light-border bg-light-surface p-6 shadow-[0_8px_40px_rgba(0,0,0,0.25)] dark:border-dark-border dark:bg-dark-surface"
                    >
                        <h2 className="mb-2 text-lg font-bold text-light-text dark:text-dark-text">{title}</h2>
                        <p className="mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary">{description}</p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-light-text-secondary hover:bg-light-bg dark:text-dark-text-secondary dark:hover:bg-dark-bg">
                                Cancel
                            </button>
                            <button type="button" onClick={onConfirm} autoFocus className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
