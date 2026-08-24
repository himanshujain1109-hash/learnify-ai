import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const VIDEO_API =
  import.meta.env.VITE_VIDEO_API_URL || "http://localhost:8000";

export default function NotesToVideo() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const pollJob = (id) => {
    if (timer.current) clearInterval(timer.current);

    const check = async () => {
      try {
        const res = await fetch(
          `${VIDEO_API}/api/video/jobs/${id}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Could not check video status.");
        }

        setStatus(data.status);
        setMessage(data.message || "");

        if (data.status === "done") {
          if (timer.current) clearInterval(timer.current);
          setLoading(false);
          setVideoUrl(`${VIDEO_API}${data.video_url}`);
        }

        if (data.status === "error") {
          if (timer.current) clearInterval(timer.current);
          setLoading(false);
          setMessage(data.message || "Video generation failed.");
        }
      } catch (err) {
        if (timer.current) clearInterval(timer.current);
        setLoading(false);
        setStatus("error");
        setMessage(err.message || "Unable to contact the video service.");
      }
    };

    check();
    timer.current = setInterval(check, 2500);
  };

  const generateVideo = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please choose a PPTX, PDF or TXT file.");
      return;
    }

    setLoading(true);
    setVideoUrl("");
    setMessage("");
    setStatus("uploading");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `${VIDEO_API}/api/video/jobs`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Could not start video generation."
        );
      }

      setJobId(data.job_id);
      setStatus(data.status);
      setMessage(
        "Your material has been uploaded. Video generation has started."
      );

      pollJob(data.job_id);
    } catch (err) {
      setLoading(false);
      setStatus("error");
      setMessage(err.message || "Video generation failed.");
    }
  };

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setFile(null);
    setJobId("");
    setStatus("");
    setMessage("");
    setVideoUrl("");
    setLoading(false);
  };

  return (
    <div className="notes-video-page">
      <div className="dash-hero">
        <div>
          <span className="eyebrow">AI VIDEO LAB</span>
          <h1>Turn notes into a video.</h1>
          <p>
            Upload your lecture material and Learnify AI will create a
            short narrated learning video from the content.
          </p>
        </div>
        <Link className="btn secondary" to="/dashboard">
          ← Dashboard
        </Link>
      </div>

      <div className="notes-video-grid">
        <form className="upload-card" onSubmit={generateVideo}>
          <span className="eyebrow">STEP 1</span>
          <h2>Upload your material</h2>
          <p className="muted">
            Supported formats: PPTX, PDF and TXT. Maximum 20 MB.
          </p>

          <div className="drop-zone" style={{ marginTop: 20 }}>
            <label htmlFor="video-file">
              <span className="upload-icon">▶</span>
              <strong>
                {file ? file.name : "Choose study material"}
              </strong>
              <span>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "PPTX · PDF · TXT"}
              </span>
            </label>
            <input
              id="video-file"
              type="file"
              accept=".pptx,.pdf,.txt"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </div>

          {message && (
            <div
              className={
                status === "error" ? "error" : "success"
              }
              style={{ marginTop: 18 }}
            >
              <strong>
                {status === "processing" || status === "queued"
                  ? "Generating video"
                  : status === "done"
                  ? "Video ready"
                  : status === "error"
                  ? "Something went wrong"
                  : "Status"}
              </strong>
              <div style={{ marginTop: 4 }}>{message}</div>
              {jobId && (
                <small style={{ display: "block", marginTop: 5 }}>
                  Job: {jobId.slice(0, 10)}...
                </small>
              )}
            </div>
          )}

          <button
            className="btn btn-primary full"
            disabled={loading}
            style={{ marginTop: 18 }}
          >
            {loading
              ? "Generating video..."
              : "Generate learning video →"}
          </button>

          {videoUrl && (
            <button
              type="button"
              className="btn secondary full"
              style={{ marginTop: 10 }}
              onClick={reset}
            >
              Create another video
            </button>
          )}
        </form>

        <section className="video-result-card">
          <span className="eyebrow">STEP 2</span>
          <h2>Your learning video</h2>

          {!videoUrl ? (
            <div className="video-placeholder">
              <div className="video-placeholder-icon">▶</div>
              <h3>Your generated video will appear here</h3>
              <p>
                Upload material to start. Depending on the number of
                pages/slides, generation can take a few minutes.
              </p>
            </div>
          ) : (
            <>
              <video
                src={videoUrl}
                controls
                className="generated-video"
              />
              <div className="row" style={{ marginTop: 14 }}>
                <a
                  className="btn"
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open video
                </a>
                <a
                  className="btn secondary"
                  href={videoUrl}
                  download
                >
                  Download
                </a>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
