import os
import uuid
from pathlib import Path
from threading import Thread

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from main_pipeline import run_pipeline


BASE_DIR = Path(__file__).resolve().parent
JOBS_DIR = BASE_DIR / "jobs"
JOBS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pptx", ".pdf", ".txt"}
MAX_FILE_MB = int(os.environ.get("MAX_FILE_MB", "20"))

app = FastAPI(title="Learnify Notes to Video")


# --------------------------------------------------
# CORS
# --------------------------------------------------

FRONTEND_URL = os.environ.get("FRONTEND_URL", "").rstrip("/")

allowed_origins = []

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# STATUS HELPERS
# --------------------------------------------------

def write_status(job_dir: Path, status: str, message: str = ""):
    (job_dir / "status.txt").write_text(
        f"{status}\n{message}",
        encoding="utf-8",
    )


def read_status(job_dir: Path):
    status_file = job_dir / "status.txt"

    if not status_file.exists():
        return {
            "status": "unknown",
            "message": "",
        }

    lines = status_file.read_text(
        encoding="utf-8"
    ).splitlines()

    return {
        "status": lines[0] if lines else "unknown",
        "message": "\n".join(lines[1:]),
    }


# --------------------------------------------------
# VIDEO PROCESSING
# --------------------------------------------------

def process_job(job_id: str, input_path: str):
    job_dir = JOBS_DIR / job_id

    try:
        write_status(
            job_dir,
            "processing",
            "Extracting material and generating the learning video...",
        )

        output_path = run_pipeline(
            input_path,
            str(job_dir),
        )

        (job_dir / "video_path.txt").write_text(
            output_path,
            encoding="utf-8",
        )

        write_status(
            job_dir,
            "done",
            "Your learning video is ready.",
        )

    except Exception as exc:
        write_status(
            job_dir,
            "error",
            f"{type(exc).__name__}: {exc}",
        )


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Learnify Notes to Video",
        "message": "Python service is running",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "learnify-notes-to-video",
    }


# --------------------------------------------------
# CREATE VIDEO JOB
# --------------------------------------------------

@app.post("/api/video/jobs")
async def create_video_job(
    file: UploadFile = File(...)
):
    filename = file.filename or ""

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PPTX, PDF and TXT files are supported.",
        )

    file_data = await file.read()

    if len(file_data) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum size is {MAX_FILE_MB} MB.",
        )

    job_id = uuid.uuid4().hex

    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    safe_filename = Path(filename).name

    input_path = job_dir / safe_filename

    input_path.write_bytes(file_data)

    write_status(
        job_dir,
        "queued",
        "Your material has been uploaded and queued.",
    )

    worker = Thread(
        target=process_job,
        args=(
            job_id,
            str(input_path),
        ),
        daemon=True,
    )

    worker.start()

    return {
        "job_id": job_id,
        "status": "queued",
    }


# --------------------------------------------------
# CHECK JOB STATUS
# --------------------------------------------------

@app.get("/api/video/jobs/{job_id}")
def get_job_status(job_id: str):

    job_dir = JOBS_DIR / job_id

    if not job_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Video job not found.",
        )

    result = read_status(job_dir)

    response = {
        "job_id": job_id,
        "status": result["status"],
        "message": result["message"],
    }

    if result["status"] == "done":
        response["video_url"] = (
            f"/api/video/jobs/{job_id}/video"
        )

    return response


# --------------------------------------------------
# GET VIDEO
# --------------------------------------------------

@app.get("/api/video/jobs/{job_id}/video")
def get_video(job_id: str):

    video_path = (
        JOBS_DIR /
        job_id /
        "output.mp4"
    )

    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video is not ready yet.",
        )

    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"learnify-{job_id}.mp4",
    )
