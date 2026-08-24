import os
import shutil
import uuid
from pathlib import Path
from threading import Thread

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from main_pipeline import run_pipeline

BASE_DIR = Path(__file__).resolve().parent
JOBS_DIR = BASE_DIR / "jobs"
JOBS_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pptx", ".pdf", ".txt"}
MAX_FILE_MB = int(os.environ.get("MAX_FILE_MB", "20"))

app = FastAPI(title="Learnify Notes to Video")

origins = [
    x.strip().rstrip("/")
    for x in os.environ.get("FRONTEND_URL", "").split(",")
    if x.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def write_status(job_dir: Path, status: str, message: str = ""):
    (job_dir / "status.txt").write_text(
        f"{status}\n{message}",
        encoding="utf-8",
    )

def read_status(job_dir: Path):
    path = job_dir / "status.txt"
    if not path.exists():
        return {"status": "unknown", "message": ""}
    lines = path.read_text(encoding="utf-8").splitlines()
    return {
        "status": lines[0] if lines else "unknown",
        "message": "\n".join(lines[1:]),
    }

def process_job(job_id: str, input_path: str):
    job_dir = JOBS_DIR / job_id
    try:
        write_status(job_dir, "processing", "Creating narration, visuals and video...")
        output = run_pipeline(input_path, str(job_dir))
        write_status(job_dir, "done", "Video is ready.")
        (job_dir / "video_path.txt").write_text(output, encoding="utf-8")
    except Exception as exc:
        write_status(job_dir, "error", str(exc))

@app.get("/health")
def health():
    return {"status": "ok", "service": "learnify-notes-to-video"}

@app.post("/api/video/jobs")
async def create_job(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PPTX, PDF and TXT files are supported.",
        )

    data = await file.read()
    if len(data) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum size is {MAX_FILE_MB} MB.",
        )

    job_id = uuid.uuid4().hex
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    safe_name = Path(filename).name
    input_path = job_dir / safe_name
    input_path.write_bytes(data)

    write_status(job_dir, "queued", "Your material is queued for processing.")

    Thread(
        target=process_job,
        args=(job_id, str(input_path)),
        daemon=True,
    ).start()

    return {
        "job_id": job_id,
        "status": "queued",
    }

@app.get("/api/video/jobs/{job_id}")
def job_status(job_id: str):
    job_dir = JOBS_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Video job not found.")

    result = read_status(job_dir)
    payload = {
        "job_id": job_id,
        "status": result["status"],
        "message": result["message"],
    }

    if result["status"] == "done":
        payload["video_url"] = f"/api/video/jobs/{job_id}/video"

    return payload

@app.get("/api/video/jobs/{job_id}/video")
def get_video(job_id: str):
    job_dir = JOBS_DIR / job_id
    video = job_dir / "output.mp4"

    if not video.exists():
        raise HTTPException(status_code=404, detail="Video is not ready.")

    return FileResponse(
        video,
        media_type="video/mp4",
        filename=f"learnify-{job_id}.mp4",
    )
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Learnify Notes-to-Video",
        "message": "Python video service is running",
        "health": "/health"
    }
