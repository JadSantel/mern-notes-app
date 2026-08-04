# Frontend Design Prompt — MERN Notes App

---

## 🧩 Project Overview

You are redesigning and rebuilding the **entire frontend** of a MERN-stack note-taking web application. The backend is already built and running. Your job is to produce **full, working React frontend code** that is visually stunning, highly polished, and fully wired to the existing REST API.

The app must feel warm, friendly, and modern — like a personal productivity tool that users enjoy opening every day. Think: **Notion meets Bear Notes**, but with an approachable, slightly playful personality rather than cold or corporate minimalism.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 19** (existing Vite + React Router v7 project) |
| Build Tool | **Vite 8** |
| Routing | **React Router DOM v7** |
| HTTP Client | **Axios** (existing `api/axios.js` interceptor that auto-attaches JWT from `localStorage`) |
| Styling | **Tailwind CSS v4** — install and configure it fresh; do **not** use plain CSS files beyond `index.css` for base resets |
| Animations | **Framer Motion** — use for page transitions, modal open/close, note card entrance, and sidebar expand/collapse |
| Icons | **Lucide React** — consistent icon set throughout the UI |
| Notifications | **React Hot Toast** — for success/error feedback on all API actions |
| Auth State | Existing **`AuthContext`** (`context/AuthContext.jsx`) — preserve its interface; only enhance the UI that consumes it |

> **Important:** Do NOT use shadcn/ui. Do NOT use any component library. Build all UI components from scratch using Tailwind utility classes.

---

## 🎨 Design System & Color Palette

### Overall Feel
Warm, friendly, and modern. The app uses a **split-mode aesthetic**: the sidebar / note list panel is **dark** (high contrast, focused, slightly moody) while the **editor / content panel is light** (soft, airy, distraction-free). This contrast makes the interface feel dynamic and intentional without being jarring.

### Color Palette

#### Dark Panel (Sidebar + Note List)
```
Background:        #1C1A17   /* Deep warm charcoal, not pure black */
Surface/Cards:     #252320   /* Slightly lifted card surface */
Border/Dividers:   #3A3733   /* Subtle warm separator */
Text Primary:      #F5F0E8   /* Warm cream — easy on the eyes */
Text Secondary:    #9E9890   /* Muted warm gray */
Text Placeholder:  #6B6660   /* Dim warm gray */
```

#### Light Panel (Editor / Content Area)
```
Background:        #FDFAF5   /* Off-white, warm paper tone */
Surface:           #FFFFFF   /* Pure white for cards/inputs */
Border:            #E8E2D9   /* Soft warm border */
Text Primary:      #1C1A17   /* Same charcoal — cohesive with dark panel */
Text Secondary:    #6B6660   /* Muted warm gray */
```

#### Accent Colors
```
Orange (Primary Action):    #F97316   /* Tailwind orange-500 — CTAs, active states, tags */
Orange Hover:               #EA6C0A   /* Slightly deeper on hover */
Yellow (Highlight/Pin):     #FCD34D   /* Tailwind yellow-300 — pinned notes, starred items */
Yellow Subtle:              #FEF9C3   /* Tailwind yellow-100 — tag chips background */
```

#### Navigation Pastels (Sidebar Nav Items)
Use these as subtle background tints on nav item hover/active — never overwhelming:
```
Pastel Peach:     #FFE4D6   /* Folders hover tint */
Pastel Lemon:     #FEF3C7   /* Tags hover tint */
Pastel Sage:      #D1FAE5   /* Attachments section tint */
Pastel Lavender:  #EDE9FE   /* Settings / misc tint */
```

#### Semantic / Status Colors
```
Success:   #22C55E   /* green-500 */
Warning:   #F59E0B   /* amber-500 */
Danger:    #EF4444   /* red-500 */
Info:      #3B82F6   /* blue-500 */
```

### Typography
- **Font:** `Inter` from Google Fonts — load weights 400, 500, 600, 700
- **Note Titles:** `font-semibold text-base` (dark panel), `font-bold text-xl` (editor header)
- **Body / Content:** `font-normal text-sm` leading relaxed
- **Labels / Metadata:** `text-xs font-medium uppercase tracking-wide` (e.g., "3 notes", "Last edited")
- **Editor font:** Consider `font-mono text-sm` for the raw content textarea, or a serif like `Georgia` as an option toggle

### Spacing & Radius
- Border radius: `rounded-xl` for cards, `rounded-2xl` for modals, `rounded-full` for tags/badges/avatars
- Consistent padding units: `p-4` (cards), `p-6` (panels), `p-8` (editor)
- Use `gap-3` and `gap-4` throughout flex/grid layouts

### Shadows
```
Card shadow (dark):   shadow-[0_2px_8px_rgba(0,0,0,0.4)]
Card shadow (light):  shadow-[0_1px_4px_rgba(0,0,0,0.08)]
Modal shadow:         shadow-[0_8px_40px_rgba(0,0,0,0.25)]
```

---

## 📐 Layout Architecture

### Three-Panel Layout (Desktop ≥ 768px)

```
┌──────────────┬────────────────────┬──────────────────────────────┐
│   SIDEBAR    │    NOTE LIST       │        EDITOR PANEL          │
│   (240px)    │    (320px)         │        (flex-1)              │
│              │                    │                              │
│  Logo        │  Search bar        │  Note title (large)          │
│  ─────────   │  Filter chips      │  Metadata (date, folder, tag)│
│  All Notes   │  ─────────────     │  ─────────────────────────   │
│  Pinned ★    │  [NoteCard]        │  Content textarea            │
│  ─────────   │  [NoteCard]        │  (distraction-free)          │
│  FOLDERS     │  [NoteCard]        │                              │
│  ─────────   │  [NoteCard]        │  Attachments strip (bottom)  │
│  TAGS        │  + New Note (FAB)  │                              │
│  ─────────   │                    │                              │
│  Settings    │                    │                              │
│  Logout      │                    │                              │
└──────────────┴────────────────────┴──────────────────────────────┘
```

### Mobile (< 768px)
- **Bottom navigation bar** with icons: Notes, Folders, Tags, Search, Profile
- Tap a note card → full-screen editor slides up
- Sidebar content accessible via bottom nav tabs
- Floating Action Button (FAB) for new note — fixed bottom-right, orange, with a `+` icon

### Sidebar Collapse
- On tablet (768–1024px), sidebar collapses to icon-only rail (64px wide)
- Framer Motion `width` animation for smooth expand/collapse
- Tooltip on hover when collapsed

---

## 📄 Pages & Routes

### `/login` — Login Page
- Full-screen **centered card** on a dark warm background (`#1C1A17`)
- Large logo / app name at top
- Fields: Email, Password
- **"Sign In" button**: orange, full-width, with loading spinner state
- Link to `/register`
- On success: redirect to `/dashboard`, store JWT in `localStorage`
- On error: shake animation on the card + red toast notification

### `/register` — Register Page
- Same full-screen layout as login
- Fields: Name, Email, Password, Confirm Password
- Client-side validation (empty fields, password match) with inline error messages
- **"Create Account" button**: orange, full-width
- Link back to `/login`

### `/dashboard` — Main App (protected via `PrivateRoute`)
- Renders the **three-panel layout** described above
- All note CRUD operations happen here — no separate note detail page (SPA behavior)

---

## ✨ Feature Specifications

### 1. Notes — CRUD

**Existing backend endpoints:**
```
GET    /api/notes             → returns array of note objects
POST   /api/notes             → body: { title, content }
GET    /api/notes/:id
PUT    /api/notes/:id         → body: { title, content }
DELETE /api/notes/:id
```

**Note data shape (current schema):**
```json
{
  "_id": "...",
  "title": "My Note",
  "content": "...",
  "user": "userId",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**UI behavior:**
- Clicking a NoteCard in the list panel opens it in the editor panel
- Editor auto-saves via `PUT /api/notes/:id` with 800ms debounce after keystroke (show a subtle "Saving…" / "Saved ✓" indicator in the editor header)
- "New Note" FAB/button: sends `POST /api/notes` with `{ title: "Untitled", content: "" }`, immediately selects the new note
- Delete: shows a confirmation modal with Framer Motion scale animation
- NoteCard shows: title, first 80 chars of content as preview, relative timestamp (e.g. "2 hours ago"), folder badge, tag chips

### 2. Pinning ⭐

> **Backend note:** The current `Note` schema does not have a `pinned` field. The prompt must instruct the AI to:
> 1. Add `pinned: { type: Boolean, default: false }` to `backend/models/Note.js`
> 2. Ensure `PUT /api/notes/:id` accepts and persists the `pinned` field
> 3. Frontend: show pinned notes at the top of the list with a yellow star icon

- Toggle pin via star icon on NoteCard (click → `PUT /api/notes/:id` with `{ pinned: true/false }`)
- Pinned section in sidebar shows count badge

### 3. Folders 📁

> **Backend note:** Requires a new `Folder` model. Instruct the AI to create:
> - `backend/models/Folder.js` → `{ name: String, user: ObjectId, color: String, createdAt }`
> - `backend/controllers/folderController.js` → CRUD: `getFolders`, `createFolder`, `updateFolder`, `deleteFolder`
> - `backend/routes/folderRoutes.js` → protected routes: `GET /api/folders`, `POST /api/folders`, `PUT /api/folders/:id`, `DELETE /api/folders/:id`
> - Add `folder: { type: ObjectId, ref: 'Folder', default: null }` to `Note` schema

**UI:**
- Sidebar "FOLDERS" section lists all folders with a colored dot indicator and note count
- Click folder → note list filters to that folder's notes
- "New Folder" inline input in sidebar (press Enter to create)
- Drag-and-drop a note card onto a folder to assign it (use HTML5 drag events or a simple context menu "Move to folder")
- Folder context menu (right-click or ⋯ button): Rename, Change color, Delete
- Colors to choose from: orange, yellow, rose, violet, teal, sky (6 Tailwind colors as swatches)

### 4. Tags 🏷️

> **Backend note:** Tags should be stored on the Note itself (not a separate collection) for simplicity:
> - Add `tags: [String]` to `Note` schema
> - Frontend manages tag creation inline — no separate `/api/tags` route needed

**UI:**
- In the editor: a tag input row below the title (`+Add tag` button → text input → press Enter or comma to add)
- Tags display as pill chips in the editor and on NoteCards
- Tag chips: `bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs font-medium`
- Sidebar "TAGS" section: auto-aggregated list of all unique tags across all notes
- Click a tag in sidebar → filters note list to notes with that tag
- Remove tag: `×` button on each chip

### 5. Attachments 📎

> **Backend note:** For this scope, implement **client-side only** attachment UI (no actual file upload to server yet — wire up later). 
> Alternatively, if implementing server-side:
> - Use `multer` middleware on the backend
> - `POST /api/notes/:id/attachments` → accepts `multipart/form-data`
> - Store file path or base64 in a new `attachments: [{ name, url, type, size }]` array on the Note schema

**UI (client-side first approach):**
- Paperclip icon in editor toolbar
- Attachment list rendered at the bottom of the editor as a horizontal strip of file cards
- Each file card shows: file icon (based on type), filename truncated, file size, `×` remove button
- Supported types: images (show thumbnail preview), PDF (show PDF icon), other files (generic icon)
- Image attachments: clicking opens a lightbox modal (Framer Motion `AnimatePresence`)

### 6. Search 🔍

- Search input in the note list panel (top, full-width)
- **Client-side filtering** across `title` and `content` fields — no backend endpoint needed
- Debounce: 300ms
- Highlight matching text in search results (wrap matched substring in `<mark>` with orange background)
- Show "No results for 'xyz'" empty state with a friendly illustration

### 7. Dark / Light Mode

- **System preference by default** (`prefers-color-scheme`) 
- Manual toggle button in the sidebar footer (sun/moon icon)
- Store preference in `localStorage` key `theme`
- The dark/light split of the three-panel layout is always present — "dark mode" deepens the dark panel further and shifts the light panel to a slightly warmer `#F5F0E8`
- Use Tailwind's `dark:` variant throughout

---

## 🧩 Component Breakdown

Build these components (one file each, in `src/components/`):

| Component | Purpose |
|---|---|
| `Sidebar.jsx` | Navigation rail with folders, tags, settings, logout |
| `NoteList.jsx` | Scrollable list of NoteCard + search bar + filter chips |
| `NoteCard.jsx` | Individual note preview card with pin toggle |
| `NoteEditor.jsx` | Right panel — title input, content textarea, tag row, attachments strip, auto-save indicator |
| `FolderItem.jsx` | Single folder row in sidebar with context menu |
| `TagChip.jsx` | Reusable tag pill component |
| `AttachmentCard.jsx` | Single attachment preview card |
| `Lightbox.jsx` | Image lightbox modal |
| `ConfirmModal.jsx` | Generic confirmation dialog |
| `SearchBar.jsx` | Search input with clear button |
| `ThemeToggle.jsx` | Sun/moon icon toggle button |
| `EmptyState.jsx` | Friendly empty state for no notes / no results |
| `Spinner.jsx` | Loading spinner for async states |
| `Avatar.jsx` | User initials avatar in sidebar footer |
| `Toast` | Handled by React Hot Toast — configure in `main.jsx` |

Pages (`src/pages/`):
| Page | Purpose |
|---|---|
| `Login.jsx` | Full-screen login form |
| `Register.jsx` | Full-screen registration form |
| `Dashboard.jsx` | Three-panel layout container |

---

## 🎞️ Animation Specifications (Framer Motion)

| Element | Animation |
|---|---|
| Page transitions (login ↔ register) | `opacity: 0→1`, `y: 20→0`, duration 0.3s ease-out |
| NoteCard mount | Stagger children, `opacity: 0→1`, `y: 10→0`, delay 0.05s per card |
| Note selection | Smooth background color transition on the selected card |
| Sidebar expand/collapse | `width` spring animation, `stiffness: 300, damping: 30` |
| Modal (ConfirmModal, Lightbox) | `scale: 0.9→1`, `opacity: 0→1`, `AnimatePresence` for unmount |
| Folder creation | Inline input slides down with `height` animation |
| Delete confirmation | Card shake (`x: [-4,4,-4,4,0]`) before modal |
| FAB (new note button) | Subtle `scale: 1.1` on hover, `scale: 0.95` on tap |
| Tag chip add | `scale: 0→1` bounce on insertion |
| "Saving..." indicator | Fade in/out with opacity transition |

---

## 🔌 API Integration Details

### Auth
- JWT stored in `localStorage` under key `token`
- Existing `src/api/axios.js` interceptor auto-attaches `Authorization: Bearer <token>` header — **do not break this**
- On 401 response: interceptor should clear localStorage and redirect to `/login`

### Auth Context (`AuthContext.jsx`)
Preserve the existing interface:
```js
const { user, login, logout, loading } = useAuth();
// user: { _id, name, email } or null
// login(email, password): async, throws on error
// logout(): clears token and user state
// loading: boolean (checking localStorage on mount)
```

### Error Handling Convention
- All API errors: display via `toast.error(err.response?.data?.message || 'Something went wrong')`
- All success actions: `toast.success('Note saved')` etc.
- Loading states: show `Spinner` component inline (not full-page spinners for most actions)

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `< 640px` (mobile) | Single panel + bottom nav, FAB |
| `640–768px` (large mobile) | Single panel, no sidebar |
| `768–1024px` (tablet) | Sidebar collapses to icon rail + note list + editor |
| `> 1024px` (desktop) | Full three-panel layout |

---

## ♿ Accessibility Requirements

- All interactive elements must have `aria-label` attributes
- Keyboard navigation: full Tab order, visible focus rings (`focus-visible:ring-2 focus-visible:ring-orange-500`)
- Color contrast: WCAG 2.1 AA minimum (4.5:1 for text, 3:1 for UI elements)
- Modals must trap focus and close on `Escape`
- Note list must be navigable via arrow keys when focused
- Images / attachments must have `alt` text

---

## 📁 File Structure to Produce

```
frontend/
  src/
    api/
      axios.js          ← preserve existing, only enhance if needed
      notesApi.js       ← NEW: all note API calls (getNotes, createNote, etc.)
      foldersApi.js     ← NEW: all folder API calls
      authApi.js        ← NEW: login, register, getMe
    components/
      Sidebar.jsx
      NoteList.jsx
      NoteCard.jsx
      NoteEditor.jsx
      FolderItem.jsx
      TagChip.jsx
      AttachmentCard.jsx
      Lightbox.jsx
      ConfirmModal.jsx
      SearchBar.jsx
      ThemeToggle.jsx
      EmptyState.jsx
      Spinner.jsx
      Avatar.jsx
    context/
      AuthContext.jsx   ← preserve interface, upgrade implementation if needed
      ThemeContext.jsx  ← NEW: manages dark/light mode preference
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
    App.jsx
    main.jsx
    index.css          ← only base resets + Google Fonts import
  tailwind.config.js   ← NEW: extend with custom colors, font, keyframes
  index.html           ← update title and meta description
```

---

## ✅ Quality Checklist (the AI must verify before finishing)

- [ ] All REST endpoints used match the exact routes listed above
- [ ] Auto-save debounce is exactly 800ms and shows visual feedback
- [ ] No `console.log` left in production code
- [ ] All Tailwind classes are valid v4 syntax
- [ ] Framer Motion `AnimatePresence` wraps all conditional renders that animate out
- [ ] `PrivateRoute` still protects `/dashboard`
- [ ] Dark mode toggle persists to `localStorage`
- [ ] Mobile bottom nav is fully functional
- [ ] Empty states exist for: no notes, no search results, no folders, no tags
- [ ] All modals have Escape key + backdrop click to close
- [ ] Toast notifications fire on: create, update, delete, login, logout, error
