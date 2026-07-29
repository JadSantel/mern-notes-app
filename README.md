# MERN Notes App — Learning Project

A minimal note-taking app built to teach: Node.js, Express, MongoDB
(via Mongoose), and JWT authentication/authorization.

## Folder structure

```
mern-notes-app/
  backend/
    config/db.js            # MongoDB connection
    models/User.js          # User schema + password hashing
    models/Note.js          # Note schema (linked to a User)
    middleware/authMiddleware.js  # verifies JWT, protects routes
    controllers/authController.js # register/login/me logic
    controllers/noteController.js # notes CRUD logic
    routes/authRoutes.js
    routes/noteRoutes.js
    server.js                # Express app entry point
    .env.example
  frontend/
    src/
      api/axios.js           # axios instance that auto-attaches JWT
      context/AuthContext.jsx
      components/            # NoteForm, NoteItem, PrivateRoute
      pages/                 # Login, Register, Dashboard
      App.jsx, main.jsx
```

## 1. Prerequisites

- Node.js 18+ installed
- A MongoDB database — either:
  - Install MongoDB locally (`mongodb://127.0.0.1:27017`), or
  - Use a free MongoDB Atlas cluster (get a connection string from
    https://www.mongodb.com/cloud/atlas)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — generate one with:
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Run it:
```bash
npm run dev
```
You should see `MongoDB connected: ...` and `Server running on http://localhost:5000`.

Test it's alive:
```bash
curl http://localhost:5000
```

## 3. Frontend setup

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173).

## 4. Try the flow

1. Register a new account (POST /api/auth/register under the hood)
2. You're auto-logged-in — a JWT is stored in `localStorage`
3. Create, edit, delete notes — every request sends
   `Authorization: Bearer <token>` and the backend checks it
4. Log out, log back in — same account, same notes
5. Try opening browser dev tools → Application → Local Storage to SEE
   the JWT sitting there. Copy it into https://jwt.io to decode the
   payload (you'll see your user id, issued-at, and expiry — note the
   signature can't be verified there without the secret).

## 5. Suggested learning path through the code

Read the files in roughly this order — each one builds on the last:

1. `backend/models/User.js` — schema definition + password hashing hook
2. `backend/controllers/authController.js` — how a JWT gets created (`jwt.sign`)
3. `backend/middleware/authMiddleware.js` — how a JWT gets verified (`jwt.verify`)
4. `backend/routes/authRoutes.js` and `noteRoutes.js` — how middleware
   gets attached to routes
5. `backend/controllers/noteController.js` — see how `req.user._id`
   (set by the middleware) is used to scope every query
6. `frontend/src/api/axios.js` — how the token is attached to outgoing
   requests, and what happens on a 401
7. `frontend/src/context/AuthContext.jsx` — how the frontend keeps track
   of "am I logged in"

## 6. Things worth experimenting with once it's running

- Change `JWT_EXPIRES_IN` to `"10s"` in `.env`, restart, log in, then
  wait 10 seconds and try loading notes — watch the 401 + auto-redirect.
- Remove `.select("-password")` in `authMiddleware.js` temporarily and
  log `req.user` — see the (hashed) password come through, then put it back.
- Try calling `PUT /api/notes/:id` with someone else's note ID using a
  tool like curl/Postman and your own token — confirm you get a 404,
  not their note.
- Add a new field to `Note` (e.g. `pinned: Boolean`), update the schema,
  controller, and the frontend form — practice the full-stack change.
