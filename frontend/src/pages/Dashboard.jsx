import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import * as notesApi from "../api/notesApi";
import Sidebar from "../components/Sidebar";
import NoteList from "../components/NoteList";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { FileText } from "lucide-react";
import NoteEditor from "../components/NoteEditor";

export default function Dashboard() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => (note.tags || []).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);
  
  const visibleNotes = selectedTag ? notes.filter((n) => n.tags?.includes(selectedTag)) : notes;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (visibleNotes.length === 0) {
      setSelectedNoteId(null);
    } else if (!visibleNotes.some((n) => n._id === selectedNoteId)) {
      setSelectedNoteId(visibleNotes[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, notes]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await notesApi.getNotes();
        setNotes(data);
        if (data.length > 0) setSelectedNoteId(data[0]._id);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      const newNote = await notesApi.createNote({
        title: "Untitled",
        content: "",
        tags: selectedTag ? [selectedTag] : [],
      });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote._id);
      toast.success("Note created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create note");
    }
  };

  const selectedNote = notes.find((n) => n._id === selectedNoteId) || null;

  const handleUpdateNote = async (id, fields) => {
    const updated = await notesApi.updateNote(id, fields);
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    return updated;
  };

  const handleDeleteNote = async (id) => {
    await notesApi.deleteNote(id);
    setNotes((prev) => {
      const remaining = prev.filter((n) => n._id !== id);
      if (id === selectedNoteId) {
        setSelectedNoteId(remaining[0]?._id || null);
      }
      return remaining;
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg">
        <Spinner size={28} className="text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        tags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        onShowAll={() => setSelectedTag(null)}
        noteCount={notes.length}
      />
      <NoteList
        notes={visibleNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleCreateNote}
      />
      {selectedNote ? (
        <NoteEditor key={selectedNote._id} note={selectedNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
          <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
        </div>
      )}
    </div>
  );
}
