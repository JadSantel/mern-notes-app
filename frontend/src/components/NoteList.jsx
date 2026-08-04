import { Plus, StickyNote } from "lucide-react";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote }) {
    return (
        <section className="flex h-full w-80 shrink-0 flex-col border-r border-dark-border bg-dark-bg" aria-label="Note list">
            <div className="flex items-center justify-between border-b border-dark-border p-4">
                <span className="text-sm font-medium text-dark-text">Notes</span>
                <button
                    type="button"
                    onClick={onCreateNote}
                    aria-label="New note"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-orange text-white"
                >
                    <Plus size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                {notes.length === 0 ? (
                    <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to get started." />
                ) : (
                    <div className="flex flex-col gap-2">
                        {notes.map((note) => (
                            <NoteCard key={note._id} note={note} isSelected={note._id === selectedNoteId} onSelect={onSelectNote} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}