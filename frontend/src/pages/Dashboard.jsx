import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as notesApi from "../api/notesApi";
import Sidebar from "../components/Sidebar";
import NoteList from "../components/NoteList";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { FileText } from "lucide-react";
import NoteEditor from "../components/NoteEditor";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

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
      const newNote = await notesApi.createNote({ title: "Untitled", content: "" });
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg">
        <Spinner size={28} className="text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar noteCount={notes.length} />
      <NoteList notes={notes} selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} onCreateNote={handleCreateNote} />
      {selectedNote ? (
        <NoteEditor key={selectedNote._id} note={selectedNote} onUpdate={handleUpdateNote} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
          <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
        </div>
      )}
    </div>
  );
}
