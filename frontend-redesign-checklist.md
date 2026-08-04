# MERN Notes App — Frontend Redesign Checklist

Work through this top to bottom, same rule as the backend checklist: don't
skip ahead. Each phase adds ONE visual/behavioral capability and ends with
something you can actually look at in the browser before moving on.

This assumes the backend checklist is already done and your original
plain-CSS frontend (Phases 8a–8i) is working. We're rebuilding the look and
adding features on top of that working foundation — the underlying
`AuthContext`, `PrivateRoute`, and `api/axios.js` interceptor logic don't
change.

Tools you'll use throughout: **terminal**, a code editor, and your
**browser DevTools** (Elements tab to inspect classes, Console for errors,
Network tab to watch autosave/search requests fire).

---

## Phase 0 — Install dependencies

**Goal:** get every package we'll need installed before writing code that
imports them, so you're never debugging "is this a code bug or a missing
package" at the same time.

- [✅] From `frontend/`, install the new packages:
  ```bash
  npm install framer-motion lucide-react react-hot-toast
  npm install -D tailwindcss @tailwindcss/vite
  ```
  - `framer-motion` — animations (card entrances, modal transitions, shake-on-error)
  - `lucide-react` — the icon set used throughout (search, plus, trash, sun/moon, etc.)
  - `react-hot-toast` — toast notifications ("Note created", "Failed to save", etc.)
  - `tailwindcss` + `@tailwindcss/vite` — Tailwind v4's Vite plugin (replaces the old `postcss.config.js` + `tailwind.config.js` setup from v3)

- [✅] Update `frontend/vite.config.js` to register the Tailwind plugin:
  ```js
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";

  // Tailwind v4 works as a Vite plugin instead of a PostCSS config file —
  // this is the biggest workflow change from v3. No more postcss.config.js
  // or content: [] globs to maintain; Tailwind scans your files automatically.
  export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
    },
  });
  ```

- [✅] **Test:** run `npm run dev` — confirm it still boots with no errors
      (Tailwind isn't actually doing anything yet, we just want to confirm
      the plugin loads without crashing).

✅ **Checkpoint:** all new packages installed, dev server still boots.

---

## Phase 1 — Design tokens & theme skeleton

**Goal:** get the color palette, fonts, and dark-mode plumbing in place
before building any real component, so every component after this can
just use the resulting utility classes (`bg-dark-bg`, `text-accent-orange`,
`dark:bg-dark-surface`, etc.) without redefining colors ad hoc.

- [✅] Replace the entire contents of `frontend/src/index.css`:
  ```css
  /* Google Fonts — Inter. CSS requires ALL @import statements to come
     before any other rules, so this has to precede the Tailwind import. */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Pulls in Tailwind's base styles, utility classes, etc. Replaces the
     old three separate @tailwind base/components/utilities directives. */
  @import "tailwindcss";

  /* By default, Tailwind v4's `dark:` variant follows the OS-level
     prefers-color-scheme media query. We want a MANUAL toggle to be able
     to override that, so we redefine `dark:` to instead key off a `.dark`
     class on an ancestor element (<html>). */
  @custom-variant dark (&:where(.dark, .dark *));

  @theme {
    /* ---- Fonts ---- */
    --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

    /* ---- Dark panel (sidebar + note list) ---- */
    --color-dark-bg: #1C1A17;
    --color-dark-surface: #252320;
    --color-dark-border: #3A3733;
    --color-dark-text: #F5F0E8;
    --color-dark-text-secondary: #9E9890;
    --color-dark-text-placeholder: #6B6660;

    /* ---- Light panel (editor) ---- */
    --color-light-bg: #FDFAF5;
    --color-light-surface: #FFFFFF;
    --color-light-border: #E8E2D9;
    --color-light-text: #1C1A17;
    --color-light-text-secondary: #6B6660;

    /* ---- Accents ---- */
    --color-accent-orange: #F97316;
    --color-accent-orange-hover: #EA6C0A;
    --color-accent-yellow: #FCD34D;
    --color-accent-yellow-subtle: #FEF9C3;

    /* ---- Sidebar nav pastels ---- */
    --color-pastel-peach: #FFE4D6;
    --color-pastel-lemon: #FEF3C7;
    --color-pastel-sage: #D1FAE5;
    --color-pastel-lavender: #EDE9FE;

    /* ---- Semantic ---- */
    --color-success: #22C55E;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --color-info: #3B82F6;
  }

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  /* Respect users who've asked their OS to reduce motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

- [✅] **Test:** temporarily drop this into `App.jsx`'s return value and run
      `npm run dev`:
  ```jsx
  <div className="bg-accent-orange text-dark-text p-4">Test</div>
  ```
  Confirm you see a solid orange box with light text — this proves your
  custom `@theme` tokens compiled into real Tailwind utility classes.
  **Delete this test div once confirmed.**

- [✅] Create `frontend/src/context/ThemeContext.jsx`:
  ```jsx
  import { createContext, useContext, useState, useEffect } from "react";

  const ThemeContext = createContext(null);

  export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
      const root = document.documentElement;
      if (theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
      setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export function useTheme() {
    return useContext(ThemeContext);
  }
  ```
  We're building the full context now even though the visual toggle button
  doesn't exist until Phase 9 — this way every component you build from
  here on can already use `dark:` classes correctly.

- [✅] Wrap `App` in `ThemeProvider` inside `frontend/src/main.jsx`, and add
      the toast container while you're in there:
  ```jsx
  import React from "react";
  import ReactDOM from "react-dom/client";
  import { Toaster } from "react-hot-toast";
  import App from "./App";
  import { ThemeProvider } from "./context/ThemeContext";
  import "./index.css";

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#252320",
              color: "#F5F0E8",
              border: "1px solid #3A3733",
            },
          }}
        />
      </ThemeProvider>
    </React.StrictMode>
  );
  ```

- [✅] **Test:** in the browser console, run
      `document.documentElement.classList.add('dark')` — confirm nothing
      visually breaks (nothing should change yet, since no component uses
      `dark:` classes). Then remove it: `.classList.remove('dark')`.

✅ **Checkpoint:** Tailwind v4 compiles your custom theme, and the dark-mode
class mechanism is wired up (even though nothing uses it visibly yet).

---

## Phase 2 — Layout shell + routing

**Goal:** get the three-panel skeleton on screen, with placeholder/empty
content, before wiring any real data to it. This isolates layout bugs
(flexbox, widths, overflow) from data bugs.

- [✅] Update the route path in `frontend/src/App.jsx` — the design uses
      `/dashboard` instead of `/`:
  ```jsx
  import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
  import { AuthProvider } from "./context/AuthContext";
  import PrivateRoute from "./components/PrivateRoute";
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import Dashboard from "./pages/Dashboard";

  export default function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
  }
  ```

- [✅] Create the small building-block components other components will
      depend on. `frontend/src/components/Spinner.jsx`:
  ```jsx
  export default function Spinner({ size = 16, className = "" }) {
    return (
      <svg
        className={`animate-spin ${className}`}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Loading"
        role="status"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }
  ```

- [✅] `frontend/src/components/Avatar.jsx`:
  ```jsx
  function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === "") return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  export default function Avatar({ name, size = 36 }) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-accent-orange text-white font-semibold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${name || "User"} avatar`}
      >
        {getInitials(name)}
      </div>
    );
  }
  ```

- [✅] `frontend/src/components/EmptyState.jsx` (reused everywhere something
      is empty — no notes, no search results, nothing selected):
  ```jsx
  export default function EmptyState({ icon: Icon, title, description }) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
        {Icon && (
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pastel-peach">
            <Icon size={22} className="text-accent-orange" />
          </div>
        )}
        <p className="font-semibold text-light-text dark:text-dark-text">{title}</p>
        {description && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-xs">
            {description}
          </p>
        )}
      </div>
    );
  }
  ```

- [✅] `frontend/src/components/ThemeToggle.jsx` (the button; wired to the
      context you already built in Phase 1):
  ```jsx
  import { Sun, Moon } from "lucide-react";
  import { useTheme } from "../context/ThemeContext";

  export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="flex h-9 w-9 items-center justify-center rounded-full text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text transition-colors focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }
  ```

- [✅] Create `frontend/src/components/Sidebar.jsx` — the dark, left-most
      panel. It's mostly static at this point (tags list comes in Phase 8):
  ```jsx
  import { StickyNote, Settings, LogOut, FolderClosed } from "lucide-react";
  import { useAuth } from "../context/AuthContext";
  import Avatar from "./Avatar";
  import ThemeToggle from "./ThemeToggle";

  export default function Sidebar({ noteCount = 0 }) {
    const { user, logout } = useAuth();

    return (
      <aside
        className="flex h-full w-60 shrink-0 flex-col border-r border-dark-border bg-dark-bg text-dark-text"
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange text-white font-bold">
            N
          </div>
          <span className="font-semibold text-lg">Notes</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-2 rounded-lg bg-dark-surface px-3 py-2 text-sm font-medium text-dark-text"
          >
            <StickyNote size={16} />
            All Notes
            <span className="ml-auto text-xs text-dark-text-placeholder">{noteCount}</span>
          </button>

          <p className="mt-5 mb-1 px-3 text-xs font-medium uppercase tracking-wide text-dark-text-placeholder">
            Folders
          </p>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-placeholder">
            <FolderClosed size={16} />
            Coming soon
          </div>
        </nav>

        <div className="border-t border-dark-border p-3">
          <button
            type="button"
            aria-label="Settings"
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            type="button"
            onClick={logout}
            className="mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={user?.username} size={32} />
              <span className="text-sm font-medium truncate max-w-[100px]">{user?.username}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    );
  }
  ```
  Note: we're being upfront that "Folders" isn't real functionality yet
  rather than building a button that looks clickable but does nothing —
  it becomes real in Phase 12 if you build it.

- [✅] Rewrite `frontend/src/pages/Dashboard.jsx` with a hardcoded skeleton
      (no API calls yet):
  ```jsx
  import Sidebar from "../components/Sidebar";
  import EmptyState from "../components/EmptyState";
  import { FileText } from "lucide-react";

  export default function Dashboard() {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar noteCount={0} />
        <section className="flex h-full w-80 shrink-0 flex-col border-r border-dark-border bg-dark-bg">
          <div className="p-4 text-dark-text-secondary text-sm">Note list goes here</div>
        </section>
        <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
          <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
        </div>
      </div>
    );
  }
  ```

- [✅] **Test:** log in, land on `/dashboard`, confirm you see three
      distinct panels — dark sidebar, dark placeholder middle panel, and a
      light-colored right panel with the empty state centered in it. Resize
      the browser window and confirm the layout doesn't break (it won't be
      mobile-responsive yet — that's Phase 10 — but it also shouldn't
      completely collapse).

✅ **Checkpoint:** the three-panel shell renders correctly with real
routing and a real (if empty) Sidebar, before any note data exists.

---

## Phase 3 — Reskin Login/Register

**Goal:** restyle the auth pages. Their LOGIC doesn't change at all here —
still just calling `useAuth().login()` / `useAuth().register()` — only the
presentation does.

- [✅] Rewrite `frontend/src/pages/Login.jsx`:
  ```jsx
  import { useState } from "react";
  import { useNavigate, Link } from "react-router-dom";
  import { motion } from "framer-motion";
  import toast from "react-hot-toast";
  import { useAuth } from "../context/AuthContext";
  import Spinner from "../components/Spinner";

  export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await login(email, password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed");
        setShake(true);
        setTimeout(() => setShake(false), 400);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: shake ? 0.4 : 0.3, ease: "easeOut" }}
          className="w-full max-w-sm rounded-2xl bg-dark-surface p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-orange text-xl font-bold text-white">
              N
            </div>
            <h1 className="text-xl font-bold text-dark-text">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent-orange py-2.5 font-medium text-white transition-colors hover:bg-accent-orange-hover disabled:opacity-60"
            >
              {isSubmitting && <Spinner size={16} />}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-text-secondary">
            No account?{" "}
            <Link to="/register" className="font-medium text-accent-orange hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }
  ```
  Two new concepts here: the `shake` state triggers a Framer Motion
  keyframe animation (`x: [-8, 8, -8, 8, 0]`) when login fails, and
  `toast.success`/`toast.error` show the little popup notifications
  instead of inline `<p className="error">`.

- [✅] Rewrite `frontend/src/pages/Register.jsx` the same way, with client-side
      validation (empty fields, password length, password match) checked
      BEFORE hitting the network:
  ```jsx
  import { useState } from "react";
  import { useNavigate, Link } from "react-router-dom";
  import { motion } from "framer-motion";
  import toast from "react-hot-toast";
  import { useAuth } from "../context/AuthContext";
  import Spinner from "../components/Spinner";

  export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
      const errors = {};
      if (!username.trim()) errors.username = "Username is required";
      else if (username.trim().length < 3) errors.username = "Must be at least 3 characters";
      if (!email.trim()) errors.email = "Email is required";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "Must be at least 6 characters";
      if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
      return errors;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const errors = validate();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      setIsSubmitting(true);
      try {
        await register(username, email, password);
        toast.success("Account created!");
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.response?.data?.message || "Registration failed");
        setShake(true);
        setTimeout(() => setShake(false), 400);
      } finally {
        setIsSubmitting(false);
      }
    };

    const Field = ({ label, error, ...inputProps }) => (
      <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
        {label}
        <input
          {...inputProps}
          className={`rounded-lg border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none ${
            error ? "border-danger" : "border-dark-border"
          }`}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );

    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: shake ? 0.4 : 0.3, ease: "easeOut" }}
          className="w-full max-w-sm rounded-2xl bg-dark-surface p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-orange text-xl font-bold text-white">
              N
            </div>
            <h1 className="text-xl font-bold text-dark-text">Create your account</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} error={fieldErrors.username} />
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
            <Field label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={fieldErrors.confirmPassword} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent-orange py-2.5 font-medium text-white transition-colors hover:bg-accent-orange-hover disabled:opacity-60"
            >
              {isSubmitting && <Spinner size={16} />}
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent-orange hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }
  ```
  Note: the design brief may call this field "Name" — our actual backend
  `User` schema stores `username`, so the label says "Username" to match
  what the API really accepts. Labeling it "Name" would look nicer but lie
  about what's being stored.

- [✅] **Test:** submit Login with a wrong password — confirm the card
      shakes and a red toast appears. Submit Register with mismatched
      passwords — confirm the "Passwords don't match" message appears
      under the field WITHOUT a network request firing (check the Network
      tab — there should be no `/auth/register` call for that failed attempt).

✅ **Checkpoint:** both auth pages are fully restyled, validation and error
feedback both work, and the underlying login/register logic is untouched.

---

## Phase 4 — NoteList + NoteCard with real data

**Goal:** replace the hardcoded middle panel from Phase 2 with a real list
fetched from the API. No search or tags yet — just fetch, display, select.

- [✅] Create `frontend/src/api/notesApi.js` — wraps every note endpoint in
      a named function so components never call raw `api.get(...)` directly:
  ```js
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
  };
  ```

- [✅] Create `frontend/src/components/NoteCard.jsx` (no tags/search
      highlighting yet — just the card):
  ```jsx
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
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          isSelected ? "border-accent-orange bg-dark-surface" : "border-dark-border bg-dark-surface hover:border-dark-text-placeholder"
        }`}
      >
        <h3 className="mb-1 truncate font-semibold text-sm text-dark-text">{note.title}</h3>
        <p className="mb-2 line-clamp-2 text-sm text-dark-text-secondary">{preview}</p>
        <span className="text-xs uppercase tracking-wide text-dark-text-placeholder">
          {formatRelativeDate(note.updatedAt)}
        </span>
      </button>
    );
  }
  ```

- [✅] Create `frontend/src/components/NoteList.jsx` (no search yet):
  ```jsx
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
  ```

- [✅] Update `frontend/src/pages/Dashboard.jsx` to fetch real notes and
      wire the list in:
  ```jsx
  import { useState, useEffect } from "react";
  import toast from "react-hot-toast";
  import * as notesApi from "../api/notesApi";
  import Sidebar from "../components/Sidebar";
  import NoteList from "../components/NoteList";
  import EmptyState from "../components/EmptyState";
  import Spinner from "../components/Spinner";
  import { FileText } from "lucide-react";

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
        <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
          <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
        </div>
      </div>
    );
  }
  ```

- [✅] **Test:** log in, confirm any notes you created earlier (via curl or
      the old plain-CSS UI) now appear as styled cards. Click the `+`
      button, confirm a new "Untitled" note appears at the top of the list
      and a success toast pops up.

✅ **Checkpoint:** the middle panel is fully data-driven — no more
hardcoded placeholder text.

---

## Phase 5 — NoteEditor + autosave

**Goal:** replace the right-panel empty state with a real editor, with
debounced autosave. No tags yet — just title + content.

- [ ] Create `frontend/src/components/NoteEditor.jsx`:
  ```jsx
  import { useState, useEffect, useRef } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import toast from "react-hot-toast";

  const AUTOSAVE_DELAY_MS = 800;

  export default function NoteEditor({ note, onUpdate }) {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || "");
    const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"

    // Reset local state whenever a DIFFERENT note is selected
    useEffect(() => {
      setTitle(note.title);
      setContent(note.content || "");
      setSaveStatus("saved");
    }, [note._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveTimer = useRef(null);

    useEffect(() => {
      if (title === note.title && content === note.content) return;

      setSaveStatus("saving");
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await onUpdate(note._id, { title, content });
          setSaveStatus("saved");
        } catch (err) {
          setSaveStatus("error");
          toast.error(err.response?.data?.message || "Failed to save note");
        }
      }, AUTOSAVE_DELAY_MS);

      return () => clearTimeout(saveTimer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, content]);

    return (
      <div className="flex h-full flex-1 flex-col bg-light-bg dark:bg-dark-bg">
        <div className="border-b border-light-border dark:border-dark-border p-8 pb-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full bg-transparent text-xl font-bold text-light-text dark:text-dark-text placeholder:text-light-text-secondary focus:outline-none"
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={saveStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="shrink-0 text-xs font-medium uppercase tracking-wide text-light-text-secondary"
              >
                {saveStatus === "saving" && "Saving…"}
                {saveStatus === "saved" && "Saved ✓"}
                {saveStatus === "error" && "Failed to save"}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-xs uppercase tracking-wide text-light-text-secondary">
            Last edited {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 resize-none bg-transparent p-8 font-mono text-sm leading-relaxed text-light-text dark:text-dark-text placeholder:text-light-text-secondary focus:outline-none"
        />
      </div>
    );
  }
  ```
  The core idea worth sitting with: `saveTimer` is a `useRef`, not
  `useState`, because updating it should NOT trigger a re-render — it's
  just bookkeeping to cancel a pending save. Every keystroke resets the
  800ms timer via the cleanup function, so a save only actually fires
  once you stop typing.

- [ ] Update `Dashboard.jsx` to compute the selected note and render
      `NoteEditor` in place of the always-empty state:
  ```jsx
  // add these imports
  import NoteEditor from "../components/NoteEditor";

  // inside the component, above the return:
  const selectedNote = notes.find((n) => n._id === selectedNoteId) || null;

  const handleUpdateNote = async (id, fields) => {
    const updated = await notesApi.updateNote(id, fields);
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    return updated;
  };

  // replace the always-empty-state div in the return with:
  {selectedNote ? (
    <NoteEditor key={selectedNote._id} note={selectedNote} onUpdate={handleUpdateNote} />
  ) : (
    <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
      <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
    </div>
  )}
  ```
  The `key={selectedNote._id}` matters: it forces React to fully remount
  `NoteEditor` whenever you select a different note, which resets all of
  its internal state cleanly.

- [ ] **Test:** select a note, type in the title — watch the indicator
      cycle **Saving… → Saved ✓** after you stop typing, with no save
      button anywhere. Open the Network tab, confirm exactly ONE `PUT
      /api/notes/:id` request fires ~800ms after you stop typing, not one
      per keystroke. Switch to a different note mid-edit — confirm your
      unsaved text doesn't leak into the newly selected note.

✅ **Checkpoint:** full read/write note editing works with real autosave
behavior.

---

## Phase 6 — Delete + ConfirmModal

**Goal:** add a delete flow with a proper confirmation dialog instead of
`window.confirm()`.

- [ ] Create `frontend/src/components/ConfirmModal.jsx`:
  ```jsx
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
              className="w-full max-w-sm rounded-2xl bg-light-surface p-6 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
            >
              <h2 className="mb-2 text-lg font-bold text-light-text">{title}</h2>
              <p className="mb-6 text-sm text-light-text-secondary">{description}</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-light-text-secondary hover:bg-light-bg">
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
  ```
  Two accessibility details worth understanding: the `useEffect` attaches
  an Escape-key listener ONLY while the modal is open (and removes it on
  close/unmount, so listeners don't pile up), and `e.stopPropagation()` on
  the inner div stops a click inside the modal from also triggering the
  backdrop's `onClick`.

- [ ] Add delete UI to `NoteEditor.jsx` — a trash icon that opens the
      modal, plus the `onDelete` prop:
  ```jsx
  // add imports
  import { Trash2 } from "lucide-react";
  import ConfirmModal from "./ConfirmModal";

  // add to component signature
  export default function NoteEditor({ note, onUpdate, onDelete }) {
    // ...existing state...
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDeleteConfirmed = async () => {
      try {
        await onDelete(note._id);
        toast.success("Note deleted");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete note");
      } finally {
        setConfirmOpen(false);
      }
    };

    // inside the header's flex row, next to the save status span:
    <button type="button" onClick={() => setConfirmOpen(true)} aria-label="Delete note" className="text-light-text-secondary hover:text-danger">
      <Trash2 size={18} />
    </button>

    // just before the closing </div> of the component, after the textarea:
    <ConfirmModal
      isOpen={confirmOpen}
      title="Delete this note?"
      description="This can't be undone."
      onConfirm={handleDeleteConfirmed}
      onCancel={() => setConfirmOpen(false)}
    />
  ```

- [ ] Add `handleDeleteNote` to `Dashboard.jsx` and pass it down:
  ```jsx
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

  // pass it to NoteEditor:
  <NoteEditor key={selectedNote._id} note={selectedNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
  ```

- [ ] **Test:** click the trash icon, confirm the modal scales in with a
      dark backdrop. Press Escape — confirm it closes without deleting.
      Reopen it, click the backdrop (not the modal) — confirm it closes.
      Reopen it and click Delete — confirm the note disappears from the
      list and, if it was the selected note, a different note (or the
      empty state, if it was the last one) takes its place.

✅ **Checkpoint:** full CRUD is done with a real confirmation UX.

---

## Phase 7 — Search

**Goal:** add client-side search with debouncing and match highlighting.

- [ ] Create `frontend/src/components/SearchBar.jsx`:
  ```jsx
  import { Search, X } from "lucide-react";

  export default function SearchBar({ value, onChange }) {
    return (
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-placeholder" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-lg border border-dark-border bg-dark-surface py-2 pl-9 pr-9 text-sm text-dark-text placeholder:text-dark-text-placeholder focus:outline-none"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-text-placeholder hover:text-dark-text">
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
  ```

- [ ] Create `frontend/src/utils/highlight.jsx` — **note the `.jsx`
      extension is required**, not `.js`, because this file returns JSX
      (`<mark>` elements). Vite's default loader won't parse JSX syntax
      inside a plain `.js` file.
  ```jsx
  export function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent-yellow text-dark-bg rounded-sm px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  }
  ```

- [ ] Update `NoteCard.jsx` to accept and use `searchQuery`:
  ```jsx
  // add import
  import { highlightMatch } from "../utils/highlight";

  // add prop
  export default function NoteCard({ note, isSelected, onSelect, searchQuery }) {
    // ...
    // replace the plain title/preview text with:
    <h3 className="mb-1 truncate font-semibold text-sm text-dark-text">
      {searchQuery ? highlightMatch(note.title, searchQuery) : note.title}
    </h3>
    <p className="mb-2 line-clamp-2 text-sm text-dark-text-secondary">
      {searchQuery ? highlightMatch(preview, searchQuery) : preview}
    </p>
  ```

- [ ] Update `NoteList.jsx` to own the search state, debounce it, and
      filter before rendering:
  ```jsx
  import { useState, useEffect } from "react";
  import { Plus, FileQuestion, StickyNote } from "lucide-react";
  import SearchBar from "./SearchBar";
  import NoteCard from "./NoteCard";
  import EmptyState from "./EmptyState";

  export default function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote }) {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
      return () => clearTimeout(timer);
    }, [searchInput]);

    const filteredNotes = notes.filter((note) => {
      if (!debouncedSearch) return true;
      const query = debouncedSearch.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.content?.toLowerCase().includes(query);
    });

    return (
      <section className="flex h-full w-80 shrink-0 flex-col border-r border-dark-border bg-dark-bg">
        <div className="flex items-center gap-2 border-b border-dark-border p-4">
          <div className="flex-1">
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>
          <button type="button" onClick={onCreateNote} aria-label="New note" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-orange text-white">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {notes.length === 0 ? (
            <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to get started." />
          ) : filteredNotes.length === 0 ? (
            <EmptyState icon={FileQuestion} title={`No results for "${debouncedSearch}"`} description="Try a different search term." />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredNotes.map((note) => (
                <NoteCard key={note._id} note={note} isSelected={note._id === selectedNoteId} onSelect={onSelectNote} searchQuery={debouncedSearch} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
  ```
  The debounce pattern: every keystroke schedules a `setDebouncedSearch`
  300ms later, but the `useEffect` cleanup cancels that timer if
  `searchInput` changes again before it fires. Filtering only ever runs
  against `debouncedSearch`, not the raw input — so a fast typist doesn't
  re-filter the list on every single keystroke.

- [ ] **Test:** type a search term that matches a note's content but not
      its title — confirm that note still shows up, with the match
      highlighted in the content preview in orange/yellow. Type a term
      that matches nothing — confirm you get the "No results for..."
      empty state instead of the "No notes yet" one. Clear the search
      (click the X) — confirm the full list returns.

✅ **Checkpoint:** search works client-side with debouncing and visual
highlighting.

---

## Phase 8 — Tags (backend change + frontend UI)

**Goal:** add tagging. This is the one phase that touches the backend
again — the current `Note` schema has no `tags` field, so without this
change, any `tags` sent from the frontend gets silently dropped by
Mongoose.

- [ ] Update `backend/models/Note.js` to add the field:
  ```js
  tags: {
    type: [String],
    default: [],
  },
  ```
  (add this inside the schema definition, alongside `title` and `content`)

- [ ] Update `backend/controllers/noteController.js` — both `createNote`
      and `updateNote` need to accept and pass through `tags`:
  ```js
  export const createNote = async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });
      const note = await Note.create({ title, content, tags, user: req.user._id });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Server error creating note" });
    }
  };

  export const updateNote = async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { title, content, tags },
        { new: true, runValidators: true }
      );
      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Server error updating note" });
    }
  };
  ```

- [ ] Restart the backend (`npm run dev` in `backend/`), and **test with
      curl before touching the frontend at all** — isolate the backend
      change from the frontend change:
  ```bash
  curl -X POST http://localhost:5000/api/notes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your_token>" \
    -d '{"title":"Tagged note","content":"testing","tags":["work","urgent"]}'
  ```
  Confirm the response includes `"tags": ["work", "urgent"]`.

- [ ] Create `frontend/src/components/TagChip.jsx`:
  ```jsx
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
  ```

- [ ] Add tag display to `NoteCard.jsx`:
  ```jsx
  // add import
  import TagChip from "./TagChip";

  // inside the card, below the date span, wrapped in a flex row together:
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
  ```

- [ ] Add tag editing to `NoteEditor.jsx` — local `tags` state, add/remove
      handlers, and include `tags` in the autosave payload:
  ```jsx
  // add imports
  import { Plus } from "lucide-react";
  import TagChip from "./TagChip";

  // add state
  const [tags, setTags] = useState(note.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // in the note-switch useEffect, also reset tags:
  setTags(note.tags || []);

  // in the autosave useEffect's guard condition, also check tags:
  if (title === note.title && content === note.content && tags === note.tags) return;
  // ...and include tags in the payload:
  await onUpdate(note._id, { title, content, tags });
  // ...and add tags to the dependency array: [title, content, tags]

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleaned = tagInput.trim().replace(/,$/, "");
    if (cleaned && !tags.includes(cleaned)) setTags([...tags, cleaned]);
    setTagInput("");
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // JSX: add this row below the "Last edited" paragraph
  <div className="flex flex-wrap items-center gap-2">
    {tags.map((tag) => <TagChip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />)}
    {showTagInput ? (
      <form onSubmit={handleAddTag} className="inline-flex">
        <input
          type="text"
          autoFocus
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onBlur={handleAddTag}
          onKeyDown={(e) => { if (e.key === ",") handleAddTag(e); }}
          placeholder="Tag name"
          className="w-24 rounded-full border border-light-border bg-light-surface px-2 py-0.5 text-xs focus:outline-none"
        />
      </form>
    ) : (
      <button type="button" onClick={() => setShowTagInput(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-light-border px-2 py-0.5 text-xs text-light-text-secondary hover:border-accent-orange hover:text-accent-orange">
        <Plus size={12} />
        Add tag
      </button>
    )}
  </div>
  ```

- [ ] Update `Sidebar.jsx` to accept and display an aggregated tag list:
  ```jsx
  // add import
  import { Hash } from "lucide-react";

  // add props
  export default function Sidebar({ tags, selectedTag, onSelectTag, onShowAll, noteCount }) {
    // change the "All Notes" button's onClick to onShowAll, and add
    // aria-current={selectedTag === null ? "page" : undefined}

    // add this block after the Folders placeholder section:
    <p className="mt-5 mb-1 px-3 text-xs font-medium uppercase tracking-wide text-dark-text-placeholder">Tags</p>
    {tags.length === 0 && <p className="px-3 py-1 text-sm text-dark-text-placeholder">No tags yet</p>}
    {tags.map((tag) => (
      <button
        key={tag}
        type="button"
        onClick={() => onSelectTag(tag)}
        className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          selectedTag === tag ? "bg-pastel-lemon text-dark-bg" : "text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text"
        }`}
      >
        <Hash size={14} />
        {tag}
      </button>
    ))}
  ```

- [ ] Update `Dashboard.jsx` to derive the unique tag list and filter by
      the selected one:
  ```jsx
  // add import
  import { useMemo } from "react";

  // add state
  const [selectedTag, setSelectedTag] = useState(null);

  // derive tags (recalculates only when notes changes)
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => (note.tags || []).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const visibleNotes = selectedTag ? notes.filter((n) => n.tags?.includes(selectedTag)) : notes;

  // pass to Sidebar:
  <Sidebar tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} onShowAll={() => setSelectedTag(null)} noteCount={notes.length} />
  // pass visibleNotes (not notes) to NoteList:
  <NoteList notes={visibleNotes} ... />
  ```

- [ ] **Test:** add two different tags to two different notes. Confirm
      both appear under "Tags" in the sidebar with no duplicates. Click
      one tag — confirm the note list filters down to only notes with
      that tag, and "All Notes" un-filters it. Remove a tag from a note
      via its `X` button — confirm autosave fires and, once the last note
      with that tag is untagged, it disappears from the sidebar.

✅ **Checkpoint:** tags work end-to-end, backend through UI.

---

## Phase 9 — Dark/light mode toggle

**Goal:** wire up the visual toggle. The underlying mechanism
(`ThemeContext`, the `.dark` class, `@custom-variant`) was already built
in Phase 1 — this phase is just making sure every component actually USES
`dark:` classes correctly, since the toggle button in `Sidebar.jsx` already
exists from Phase 2.

- [ ] Audit each component you've built and confirm light-panel elements
      (`NoteEditor`, `ConfirmModal`, `EmptyState`) have a `dark:` variant
      alongside their light-mode color, e.g.:
  ```
  bg-light-bg dark:bg-dark-bg
  text-light-text dark:text-dark-text
  border-light-border dark:border-dark-border
  ```
  The dark-panel components (`Sidebar`, `NoteList`, `NoteCard`,
  `SearchBar`) don't need `dark:` variants at all — per the design, they
  stay dark in both modes; only the editor's light panel actually flips.

- [ ] **Test:** click the sun/moon icon in the sidebar footer. Confirm the
      right-hand editor panel switches between light and dark backgrounds
      while the sidebar/note-list stay visually the same. Refresh the
      page — confirm your last choice persisted (check
      `localStorage.getItem("theme")` in DevTools). Open DevTools →
      rendering → emulate `prefers-color-scheme: dark`, clear
      `localStorage`, and reload — confirm the app starts in dark mode
      automatically, matching the OS preference.

✅ **Checkpoint:** manual dark mode toggle works and overrides/persists
independent of the OS setting.

---

## Phase 10 — Mobile responsive (not yet built — guidance)

**Goal:** collapse the three-panel desktop layout into something usable
on a narrow viewport. This phase is a bigger lift than the others and
worth tackling as its own focused session.

- [ ] Decide the breakpoint strategy: Tailwind's default `md:` (768px) is
      a reasonable cutoff between "desktop three-panel" and "mobile
      single-panel."
- [ ] Add mobile-only state to `Dashboard.jsx`, e.g. `const [mobileView,
      setMobileView] = useState("list")` cycling between `"list"` and
      `"editor"` — on mobile you show ONE panel at a time instead of three
      side by side.
- [ ] Hide `Sidebar` behind a hamburger/drawer on mobile (`hidden md:flex`
      on the `<aside>`, plus a slide-in drawer version).
- [ ] Selecting a note on mobile should switch `mobileView` to `"editor"`
      and show a back button in `NoteEditor`'s header that switches it
      back to `"list"`.
- [ ] Test at a few real breakpoints (375px, 768px, 1024px) using
      DevTools' device toolbar, not just by shrinking the browser window.

---

## Phase 11 — Animation polish (recap)

Most of this was actually threaded through earlier phases rather than
being one big pass at the end — worth reviewing what's already in place
and where the gaps are:

- [✓] Card entrance / stagger — `NoteList`'s `motion.div` with
      `staggerChildren`
- [✓] Modal scale in/out — `ConfirmModal`'s `AnimatePresence` + `motion.div`
- [✓] Tag bounce-in — `TagChip`'s spring transition
- [✓] Save-status fade — `NoteEditor`'s `AnimatePresence mode="wait"`
- [✓] Shake-on-error — `Login`/`Register`'s keyframe `x` animation
- [✓] FAB hover/tap — the `+` button's `hover:scale-110 active:scale-95`
- [ ] Sidebar collapse animation — depends on Phase 10 existing first
- [ ] Page transition between `/login` and `/dashboard` — not built;
      would need `AnimatePresence` wrapping the `<Routes>` in `App.jsx`

---

## Phase 12 (stretch) — Folders & server-side attachments

**Folders** — mirrors exactly how you built `Note` ownership in the
backend checklist:
- [ ] Add a `Folder` model: `{ name, user (ref User) }`
- [ ] Add `folder: { type: ObjectId, ref: "Folder", default: null }` to
      the `Note` schema
- [ ] New `folderController.js` + `folderRoutes.js`, same CRUD +
      ownership-filtering pattern as `noteController.js`
- [ ] Frontend: `foldersApi.js`, replace the Sidebar's "Coming soon" block
      with a real list + create-folder input, filter notes by
      `folder` the same way you already filter by `tag`

**Server-side attachments** — needs a new dependency and storage strategy:
- [ ] `npm install multer` in the backend for handling `multipart/form-data`
      uploads
- [ ] Decide where files live — local disk (simplest, fine for learning)
      vs. a cloud bucket (S3/Cloudinary, more realistic for production)
- [ ] Add an `attachments: [{ filename, url, mimetype }]` array to `Note`
- [ ] New upload route, protected the same way `noteRoutes.js` is

Both of these are good candidates for "build it yourself using the
pattern you already know" rather than more code to copy — by this point
you've built the ownership-filtering CRUD pattern three times (notes,
and now potentially folders/attachments), which is exactly the kind of
repetition that makes it actually stick.
