# Learnify Notes-to-Video Service

This service is intentionally separate from the Vercel React app because video generation is long-running and uses Python, MoviePy/FFmpeg and local job files.

## Local run

```bash
cd video-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt

# set ANTHROPIC_API_KEY
uvicorn server:app --host 0.0.0.0 --port 8000
```

Health check:
`GET http://localhost:8000/health`

The React app expects:
`VITE_VIDEO_API_URL=http://localhost:8000`

## Deploy

Deploy this folder to a Python-friendly service such as Render or Railway. Set:

- ANTHROPIC_API_KEY
- ANTHROPIC_MODEL
- FRONTEND_URL
- MAX_FILE_MB

Then set `VITE_VIDEO_API_URL` in the Vercel frontend project to the deployed service URL and redeploy the frontend.

## Important

The service keeps generated jobs on its own disk. For a production system where videos must survive service restarts/redeploys, replace the local `jobs/` directory with object storage such as S3/Cloudinary/Supabase Storage.
