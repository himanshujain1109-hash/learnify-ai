# Notes-to-Video integration

## What was added

- `frontend/src/pages/NotesToVideo.jsx`
- `/notes-to-video` protected route
- Dashboard Notes → Video feature card
- Navbar Notes → Video link
- `video-service/` Python/FastAPI service
- Unique background video jobs instead of one shared output_video.mp4
- PPTX, PDF and TXT extraction
- Job polling from the React interface
- Video player + open/download controls

## Architecture

Vercel hosts the React app. The Python service runs separately because video generation is long-running and requires Python/FFmpeg.

React -> `VITE_VIDEO_API_URL` -> FastAPI -> job -> generated MP4.

## Vercel

Add:

`VITE_VIDEO_API_URL=https://YOUR-PYTHON-SERVICE-URL`

Then redeploy.

## Python service

Deploy the `video-service` folder to Render/Railway or another Python service.

Build/install:
`pip install -r requirements.txt`

Start:
`uvicorn server:app --host 0.0.0.0 --port $PORT`

Environment:
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL=claude-sonnet-4-6`
- `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`
- `MAX_FILE_MB=20`

## Local development

Run Python:
`uvicorn server:app --reload --port 8000`

Run React:
`npm --prefix frontend run dev`

Set:
`VITE_VIDEO_API_URL=http://localhost:8000`

## Important production note

The current service stores jobs/videos on local disk. For durable production storage, move `video-service/jobs/` to object storage.
