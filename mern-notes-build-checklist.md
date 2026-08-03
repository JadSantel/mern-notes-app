# MERN Notes App — Build Checklist

Work through this top to bottom. Don't skip ahead — each phase has exactly
one new concept, and each ends with a manual test so you know it works
before building on top of it. Check items off as you go.

Tools you'll use throughout: **terminal**, a code editor, **curl** or
**Postman/Insomnia** for testing the API, and **MongoDB Compass** or
**mongosh** for peeking at the database directly.

---

## Phase 0 — Bare-bones Express server

**Goal:** prove Express itself works before touching a database or auth.

- [✅] Create the project folder and initialize npm
  ```bash
  mkdir mern-notes-app && cd mern-notes-app
  mkdir backend && cd backend
  npm init -y
  ```
- [✅] Open `backend/package.json` and add `"type": "module"` at the top level
      (lets us use `import`/`export` instead of `require`)
- [✅] Install dependencies
  ```bash
  npm install express dotenv cors
  npm install --save-dev nodemon
  ```
- [✅] Add scripts to `package.json`:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  ```
- [✅] Create `backend/server.js`:
  ```js
  import express from "express";

  const app = express();

  app.get("/", (req, res) => {
    res.json({ message: "MERN Notes API is running" });
  });

  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  ```
- [✅] Run it: `npm run dev`
- [✅] **Test:** in a second terminal, run:
  ```bash
  curl http://localhost:5000
  ```
  Expect: `{"message":"MERN Notes API is running"}`

✅ **Checkpoint:** Express server boots and responds. Do not continue until this works.

---

## Phase 1 — Database connection

**Goal:** prove Node can talk to MongoDB, with nothing else attached yet.

- [✅] Get a MongoDB instance ready (pick one):
  - **Local:** install MongoDB Community Server for your OS, make sure the
    `mongod` service is running (default: `mongodb://127.0.0.1:27017`)
  - **Cloud (easier, recommended for beginners):** create a free cluster at
    https://www.mongodb.com/cloud/atlas, create a database user, allow your
    IP in Network Access, and copy the connection string (looks like
    `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`)
- [✅] Install Mongoose
  ```bash
  npm install mongoose
  ```
- [✅] Create `backend/.env`:
  ```
  MONGO_URI=mongodb://127.0.0.1:27017/mern-notes
  PORT=5000
  ```
  (swap in your Atlas string if using the cloud option)
- [✅] Create `backend/.gitignore`:
  ```
  node_modules
  .env
  ```
- [✅] Create `backend/config/db.js`:
  ```js
  import mongoose from "mongoose";

  const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  };

  export default connectDB;
  ```
- [✅] Update `backend/server.js` to load env vars and connect:
  ```js
  import express from "express";
  import dotenv from "dotenv";
  import connectDB from "./config/db.js";

  dotenv.config();
  connectDB();

  const app = express();
  // ...rest stays the same
  ```
- [ ] Run `npm run dev`
- [ ] **Test:** confirm you see `MongoDB connected: ...` printed in the
      terminal with no errors. If you see a connection error, double-check
      your `MONGO_URI`, that `mongod` is running (local) or your IP is
      allow-listed (Atlas).

✅ **Checkpoint:** server connects to MongoDB on boot.

---

## Phase 2 — One model, no auth (prove Mongoose CRUD works)

**Goal:** get data into and out of MongoDB before any security is layered on.

- [✅] Create `backend/models/Note.js` (no `user` field yet):
  ```js
  import mongoose from "mongoose";

  const noteSchema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      content: { type: String, default: "" },
    },
    { timestamps: true }
  );

  const Note = mongoose.model("Note", noteSchema);
  export default Note;
  ```
- [✅] Create `backend/controllers/noteController.js` with just two functions:
  ```js
  import Note from "../models/Note.js";

  export const getNotes = async (req, res) => {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  };

  export const createNote = async (req, res) => {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  };
  ```
- [✅] Create `backend/routes/noteRoutes.js`:
  ```js
  import express from "express";
  import { getNotes, createNote } from "../controllers/noteController.js";

  const router = express.Router();
  router.route("/").get(getNotes).post(createNote);

  export default router;
  ```
- [✅] Update `backend/server.js`:
  ```js
  import noteRoutes from "./routes/noteRoutes.js";
  // ...
  app.use(express.json()); // needed to parse JSON request bodies
  app.use("/api/notes", noteRoutes);
  ```
- [✅] Run `npm run dev`
- [✅] **Test create:**
  ```bash
  curl -X POST http://localhost:5000/api/notes \
    -H "Content-Type: application/json" \
    -d '{"title":"My first note","content":"Hello world"}'
  ```
  Expect a JSON object back with `_id`, `title`, `content`, `createdAt`, `updatedAt`.
- [✅] **Test read:**
  ```bash
  curl http://localhost:5000/api/notes
  ```
  Expect an array containing the note you just created.
- [✅] **Optional:** open MongoDB Compass or `mongosh`, connect to your DB,
      and visually confirm the `notes` collection has your document.

✅ **Checkpoint:** you have a working, but fully public/insecure, notes API.
This is expected at this stage — don't add auth checks here yet.

---

## Phase 3 — User model + registration (hashing, no login yet)

**Goal:** get a user stored with a properly hashed password.

- [✅] Install bcrypt
  ```bash
  npm install bcryptjs
  ```
- [✅] Create `backend/models/User.js`:
  ```js
  import mongoose from "mongoose";
  import bcrypt from "bcryptjs";

  const userSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true },
      password: { type: String, required: true, minlength: 6, select: false },
    },
    { timestamps: true }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  const User = mongoose.model("User", userSchema);
  export default User;
  ```
- [✅] Create `backend/controllers/authController.js` with **registration only**
      (no token yet — just return the created user):
  ```js
  import User from "../models/User.js";

  export const registerUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide username, email, and password" });
      }

      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({ username, email, password });
      res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Server error during registration" });
    }
  };
  ```
- [✅] Create `backend/routes/authRoutes.js`:
  ```js
  import express from "express";
  import { registerUser } from "../controllers/authController.js";

  const router = express.Router();
  router.post("/register", registerUser);

  export default router;
  ```
- [✅] Update `backend/server.js`:
  ```js
  import authRoutes from "./routes/authRoutes.js";
  // ...
  app.use("/api/auth", authRoutes);
  ```
- [✅] Run `npm run dev`
- [✅] **Test:**
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"alice","email":"alice@example.com","password":"password123"}'
  ```
  Expect a user object back (no password field, since we excluded it from the response).
- [✅] **Verify hashing:** open Compass/mongosh, look at the `users`
      collection, confirm the `password` field is a long bcrypt string like
      `$2a$10$...`, NOT `password123`.
- [✅] **Test duplicate rejection:** run the same curl command again — expect
      a 400 error about the user already existing.

✅ **Checkpoint:** passwords are hashed before storage, duplicates are blocked.

---

## Phase 4 — Login + JWT issuance

**Goal:** verify a password and hand back a signed token.

- [✅] Install jsonwebtoken
  ```bash
  npm install jsonwebtoken
  ```
- [✅] Generate a real secret and add it to `.env`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  Copy the output into `.env`:
  ```
  JWT_SECRET=<paste the long random string here>
  JWT_EXPIRES_IN=7d
  ```
- [✅] Add a `matchPassword` method to `backend/models/User.js` (below the
      `pre("save")` hook):
  ```js
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  ```
- [✅] Update `backend/controllers/authController.js`: add a token generator
      and wire it into both register and a new `loginUser`:
  ```js
  import jwt from "jsonwebtoken";

  const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  };

  // in registerUser, change the final res.status(201).json(...) to also include:
  // token: generateToken(user._id)

  export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  };
  ```
- [✅] Add the route in `backend/routes/authRoutes.js`:
  ```js
  import { registerUser, loginUser } from "../controllers/authController.js";
  router.post("/login", loginUser);
  ```
- [✅] Run `npm run dev`
- [✅] **Test:**
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}'
  ```
  Expect a JSON response including a long `token` string.
- [✅] **Inspect the token:** copy the token value, paste it into
      https://jwt.io — confirm the decoded payload shows
      `{ "id": "...", "iat": ..., "exp": ... }`.
- [✅] **Test wrong password:** rerun with a bad password, expect 401
      `Invalid email or password`.

✅ **Checkpoint:** login returns a real, decodable JWT.

---

## Phase 5 — The `protect` middleware

**Goal:** gate a route so it only works with a valid token. This is the
most important checkpoint in the project — test all three cases below
before moving on.

- [✅] Create `backend/middleware/authMiddleware.js`:
  ```js
  import jwt from "jsonwebtoken";
  import User from "../models/User.js";

  const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
          return res.status(401).json({ message: "User no longer exists" });
        }
        next();
      } catch (error) {
        res.status(401).json({ message: "Not authorized, token invalid or expired" });
      }
    } else {
      res.status(401).json({ message: "Not authorized, no token provided" });
    }
  };

  export default protect;
  ```
- [✅] Add a throwaway protected route to try it out — in
      `backend/controllers/authController.js`:
  ```js
  export const getMe = async (req, res) => {
    res.json(req.user);
  };
  ```
  in `backend/routes/authRoutes.js`:
  ```js
  import protect from "../middleware/authMiddleware.js";
  import { registerUser, loginUser, getMe } from "../controllers/authController.js";
  router.get("/me", protect, getMe);
  ```
- [✅] Run `npm run dev`
- [✅] **Test 1 — no token:**
  ```bash
  curl http://localhost:5000/api/auth/me
  ```
  Expect: 401 `Not authorized, no token provided`
- [✅] **Test 2 — garbage token:**
  ```bash
  curl http://localhost:5000/api/auth/me -H "Authorization: Bearer garbage.token.here"
  ```
  Expect: 401 `Not authorized, token invalid or expired`
- [✅] **Test 3 — real token:** log in again to get a fresh token, then:
  ```bash
  curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <paste real token>"
  ```
  Expect: your user object (id, username, email — no password)

✅ **Checkpoint:** all three cases behave correctly. Do not continue until
this is rock solid — everything after this depends on it.

---

## Phase 6 — Tie ownership together (notes + auth meet)

**Goal:** connect Phase 2 (notes) and Phase 5 (auth) so notes belong to users.

- [✅] Update `backend/models/Note.js` to add the ownership field:
  ```js
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  ```
- [✅] Rewrite `backend/controllers/noteController.js` to filter/stamp by
      `req.user._id` on every operation. Full CRUD set:
  ```js
  import Note from "../models/Note.js";

  export const getNotes = async (req, res) => {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  };

  export const getNoteById = async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  };

  export const createNote = async (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const note = await Note.create({ title, content, user: req.user._id });
    res.status(201).json(note);
  };

  export const updateNote = async (req, res) => {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  };

  export const deleteNote = async (req, res) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted", id: req.params.id });
  };
  ```
- [✅] Update `backend/routes/noteRoutes.js` to require auth on everything:
  ```js
  import express from "express";
  import protect from "../middleware/authMiddleware.js";
  import {
    getNotes, getNoteById, createNote, updateNote, deleteNote,
  } from "../controllers/noteController.js";

  const router = express.Router();
  router.use(protect);

  router.route("/").get(getNotes).post(createNote);
  router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

  export default router;
  ```
- [✅] Run `npm run dev`
- [✅] **Test — register two separate users** (alice and bob), log in as
      each, save both tokens.
- [✅] **Test — create a note as alice:**
  ```bash
  curl -X POST http://localhost:5000/api/notes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <alice_token>" \
    -d '{"title":"Alice secret note","content":"shh"}'
  ```
  Copy the returned `_id`.
- [✅] **Test — bob tries to read it directly:**
  ```bash
  curl http://localhost:5000/api/notes/<alice_note_id> \
    -H "Authorization: Bearer <bob_token>"
  ```
  Expect: 404 `Note not found` (not alice's note content)
- [✅] **Test — bob tries to delete it:**
  ```bash
  curl -X DELETE http://localhost:5000/api/notes/<alice_note_id> \
    -H "Authorization: Bearer <bob_token>"
  ```
  Expect: 404, and confirm in Compass/mongosh that the note still exists.
- [✅] **Test — alice can still read/update/delete her own note** using her
      own token — expect success.

✅ **Checkpoint:** ownership is enforced server-side. This is the core
security property of the whole app — don't move to the frontend until
this passes cleanly.

---

## Phase 7 — Error handling & polish

- [✅] Add CORS so the frontend (different port) can call this API:
  ```bash
  npm install cors
  ```
  In `server.js`:
  ```js
  import cors from "cors";
  app.use(cors());
  ```
- [✅] Add a 404 handler (after all routes) in `server.js`:
  ```js
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
  });
  ```
- [✅] Add a global error handler (very bottom of `server.js`, 4 arguments):
  ```js
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server" });
  });
  ```
- [✅] Add a simple request logger for visibility while developing:
  ```js
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });
  ```
- [✅] **Test:** hit a nonexistent route (`curl http://localhost:5000/api/nope`)
      and confirm you get your custom 404 JSON, not an HTML error page.

✅ **Checkpoint:** backend is complete and production-shaped. Everything
past this point is frontend work consuming a trustworthy API.

---

## Phase 8 — Frontend, in order

### 8a. Scaffold the project
- [✅] From the project root (one level above `backend/`):
  ```bash
  npm create vite@latest frontend -- --template react
  cd frontend
  npm install
  npm install axios react-router-dom
  ```
- [✅] Run `npm run dev`, open the printed URL, confirm the default Vite +
      React page loads.

### 8b. Bare axios instance (no interceptors yet)
- [✅] Create `frontend/src/api/axios.js`:
  ```js
  import axios from "axios";

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  export default api;
  ```

### 8c. Login/Register pages — confirm you can get a token
- [✅] Build a minimal `Login.jsx` that calls
      `api.post("/auth/login", { email, password })` and
      `console.log`s the response.
- [✅] Run both servers (backend on 5000, frontend on 5173), submit the
      login form with a real account, and **confirm you see the token
      logged in the browser console.**

### 8d. Persist the token and auto-attach it
- [✅] In `Login.jsx`, after a successful login:
  ```js
  localStorage.setItem("token", data.token);
  ```
- [✅] Add a request interceptor to `frontend/src/api/axios.js`:
  ```js
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
- [✅] **Test:** manually call `api.get("/auth/me")` (e.g. temporarily in a
      `useEffect`) and confirm it returns your user — proving the token is
      being attached automatically now.

### 8e. Auth context (global logged-in state)
- [✅] Create `frontend/src/context/AuthContext.jsx` with `login`,
      `register`, `logout`, and a `user` state, backed by `localStorage`
      (see reference implementation from earlier if you want the full
      version, including the startup `/auth/me` verification check).
- [✅] Wrap `<App />` in `<AuthProvider>` inside `main.jsx` or `App.jsx`.
- [✅] Rebuild `Login.jsx`/`Register.jsx` to call `useAuth().login(...)`
      instead of calling `api` directly.

### 8f. Routing + route guard
- [✅] Install is already done (`react-router-dom`).
- [✅] Create `frontend/src/components/PrivateRoute.jsx` that redirects to
      `/login` if `user` is null.
- [✅] Wire up `BrowserRouter`/`Routes`/`Route` in `App.jsx` for `/login`,
      `/register`, and `/` (protected).
- [✅] **Test:** while logged out, try visiting `/` directly — confirm you
      get bounced to `/login`.

### 8g. Dashboard — read-only first
- [✅] Build `Dashboard.jsx` that only fetches and lists notes
      (`api.get("/notes")`) — no create/edit/delete yet.
- [✅] **Test:** log in, confirm your existing notes (created via curl in
      Phase 6) show up on screen.

### 8h. Add create, then update, then delete
- [ ] Add `NoteForm.jsx`, wire its `onSave` to `api.post("/notes", fields)`
      in `Dashboard.jsx`. Test creating a note through the UI.
- [ ] Add `NoteItem.jsx` with an edit mode that reuses `NoteForm`, wire to
      `api.put(\`/notes/${id}\`, fields)`. Test editing.
- [ ] Add a delete button, wire to `api.delete(\`/notes/${id}\`)`. Test
      deleting.

### 8i. Handle token expiry gracefully
- [ ] Add a response interceptor in `axios.js` that clears storage and
      redirects to `/login` on a 401.
- [ ] **Test:** temporarily set `JWT_EXPIRES_IN=10s` in the backend `.env`,
      restart the backend, log in on the frontend, wait 10+ seconds, then
      try loading/creating a note — confirm you get bounced to `/login`
      automatically. **Remember to set `JWT_EXPIRES_IN` back to `7d`
      afterward.**

✅ **Final checkpoint:** full register → login → CRUD → logout → token
expiry flow works end to end, and you understand what each piece is doing
because you built it in isolation, one failure mode at a time.

---

## Stretch goals (optional, once everything above works)

- [ ] Add a `pinned: Boolean` field to notes — practice a full-stack change
      (schema → controller → route → frontend form → UI)
- [ ] Add pagination to `GET /api/notes`
- [ ] Add a "change password" endpoint (needs current-password verification)
- [ ] Add refresh tokens instead of one long-lived access token
- [ ] Write a few automated tests (e.g. with `jest` + `supertest`) for the
      auth middleware's three cases from Phase 5
