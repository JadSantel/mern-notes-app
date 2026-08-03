import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchNotes();
  }, []);

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

      {loading && <p>Loading notes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && notes.length === 0 && <p>No notes yet.</p>}

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
