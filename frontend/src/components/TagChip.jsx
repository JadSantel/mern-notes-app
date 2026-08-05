import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function TagChip({ label, onRemove }) {
    return (
        <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="inline-flex items-center gap-1 rounded-full bg-accent-yellow-subtle px-2 py-0.5 text-xs font-medium text-yellow-800"
        >
        {label}
        {onRemove && (
            <button type="button" onClick={onRemove} aria-label={`Remove tag ${label}`} className="hover:text-danger rounded-full">
            <X size={12} />
            </button>
        )}
        </motion.span>
    );
}