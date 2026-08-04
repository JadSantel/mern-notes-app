import api from "./axios";

export const getNotes = async () => {
    const { data } = await api.get("/notes");
    return data;
};

export const getNoteById = async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
};

export const createNote = async ({ title, content = "", tags = [] }) => {
    const { data } = await api.post("/notes", { title, content, tags });
    return data;
};

export const updateNote = async (id, { title, content, tags }) => {
    const { data } = await api.put(`/notes/${id}`, { title, content, tags });
    return data;
};

export const deleteNote = async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
}