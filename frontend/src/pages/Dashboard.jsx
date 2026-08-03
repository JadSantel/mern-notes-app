import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NoteForm from "../components/NoteForm";
import NoteItem from "../components/NoteItem";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user = null, logout = () => {} } = useAuth() ?? {};
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/notes");
      setNotes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (fields) => {
    try {
      await api.post("/notes", fields);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create note");
    }
  };

  const handleUpdate = async (id, fields) => {
    try {
      await api.put(`/notes/${id}`, fields);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update note");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username || "user"}!</p>
      <button type="button" onClick={handleLogout}>
        Log Out
      </button>

      <h2>Create a note</h2>
      <NoteForm onSave={handleCreate} />

      {loading && <p>Loading notes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && notes.length === 0 && <p>No notes yet.</p>}

      <ul>
        {notes.map((note) => (
          <NoteItem key={note._id} note={note} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
