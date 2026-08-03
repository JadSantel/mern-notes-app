import { useState } from "react";
import NoteForm from "./NoteForm";

export default function NoteItem({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  const handleSave = async (fields) => {
    await onUpdate(note._id, fields);
    setEditing(false);
  };

  return (
    <li>
      {editing ? (
        <NoteForm
          initialValues={{ title: note.title, content: note.content }}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <strong>{note.title}</strong>
          <p>{note.content}</p>
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete(note._id)}>
            Delete
          </button>
        </>
      )}
    </li>
  );
}
