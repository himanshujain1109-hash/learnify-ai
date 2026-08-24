import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Learnify Notes to Video")

frontend_url = os.environ.get(
    "FRONTEND_URL",
    "*"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if frontend_url == "*" else [frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Learnify Notes to Video",
        "message": "Python service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "learnify-notes-to-video",
        "message": "Health check successful"
    }
