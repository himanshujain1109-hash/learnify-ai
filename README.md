# Learnify AI

Learnify AI is a student-focused AI learning workspace that turns uploaded academic material into structured topics, teacher-style lessons, quizzes and a material-grounded AI Tutor.

## Project structure

- `frontend/` — React + Vite student interface
- `backend/` — MongoDB models, authentication, Gemini helpers and backend logic
- `api/` — Vercel serverless adapters that expose the backend as `/api/*`

## Run locally

This project has two separately-run services: the backend (`backend/`, an Express server) and the frontend (`frontend/`, a Vite + React app).

1. Install Node.js 20+.
2. **Backend:**
   ```
   cd backend
   npm install
   cp ../.env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
   npm start
   ```
   This starts the API on `http://localhost:5000`.
3. **Frontend** (in a second terminal):
   ```
   cd frontend
   npm install
   echo "VITE_API_URL=http://localhost:5000" > .env
   npm run dev
   ```
   Open the Vite URL shown in the terminal.

## Production deployment

You can deploy either as one combined app or as two separate services.

**Option A — Two separate services (Render backend + Vercel/Netlify frontend):**
1. Deploy `backend/` to Render as a Node web service (start command `npm start`, root directory `backend`). Set `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and `FRONTEND_URL` (the frontend's deployed URL, no trailing slash) in Render's Environment settings.
2. Deploy `frontend/` to Vercel/Netlify. Set `VITE_API_URL` to the full Render backend URL (e.g. `https://learnify-ai-backend.onrender.com`).
3. **Both values must match exactly** — a mismatched `FRONTEND_URL`/`VITE_API_URL` (wrong URL, trailing slash, http vs https) is the most common cause of registration/login failing in this setup. Check the backend's boot logs on Render — it prints the exact origins it will accept.

**Option B — Single Vercel deployment:** deploy the whole repo to Vercel. It builds `frontend/` and serves the serverless functions in `api/` from the same domain. Set `VITE_API_URL=/api` and skip `FRONTEND_URL`/CORS entirely since everything shares one origin.

## Supported uploads

PDF, DOCX and TXT files up to the configured upload limit.
