import TagChip from "./TagChip";

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const diffMs = new Date() - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function NoteCard({ note, isSelected, onSelect }) {
    const preview = note.content?.slice(0, 100) || "";
    return (
        <button
            type="button"
            onClick={() => onSelect(note._id)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${isSelected ? "border-accent-orange bg-dark-surface" : "border-dark-border bg-dark-surface hover:border-dark-text-placeholder"
                }`}
        >
            <h3 className="mb-1 truncate font-semibold text-sm text-dark-text">{note.title}</h3>
            <p className="mb-2 line-clamp-2 text-sm text-dark-text-secondary">{preview}</p>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-dark-text-placeholder">
                    {formatRelativeDate(note.updatedAt)}
                </span>
                {note.tags?.length > 0 && (
                    <div className="flex gap-1 overflow-hidden">
                        {note.tags.slice(0, 2).map((tag) => <TagChip key={tag} label={tag} />)}
                    </div>
                    )}
            </div>
        </button>
    );
}