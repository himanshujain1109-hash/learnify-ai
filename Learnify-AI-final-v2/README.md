# Learnify AI

Learnify AI is a student-focused AI learning workspace that turns uploaded academic material into structured topics, teacher-style lessons, quizzes and a material-grounded AI Tutor.

## Project structure

- `frontend/` — React + Vite student interface
- `backend/` — MongoDB models, authentication, Gemini helpers and backend logic
- `api/` — Vercel serverless adapters that expose the backend as `/api/*`

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and fill in MongoDB, Gemini and JWT values.
3. Run `npm install` from the project root.
4. Run `npm run dev`.
5. Open the Vite URL shown in the terminal.

## Production / Vercel

The root `vercel.json` builds `frontend/` and serves the serverless API from `api/`. Add the same environment variables in the Vercel project settings.

## Supported uploads

PDF, DOCX and TXT files up to the configured upload limit.
