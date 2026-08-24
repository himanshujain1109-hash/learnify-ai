import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadMaterial } from "../services/materials";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Choose a PDF, DOCX or TXT file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await uploadMaterial(file, title);

      const materialId = data?.material?._id;
      if (!materialId) {
        throw new Error("Upload succeeded, but the server did not return a material ID.");
      }

      // The API returns the created MongoDB id. Navigate only after the
      // database write has completed, avoiding a race with the material page.
      navigate(`/materials/${encodeURIComponent(materialId)}`, { replace: true });
    } catch (err) {
      setError(
        err.friendlyMessage ||
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <span className="eyebrow">STUDY HUB</span>
      <h1>Bring your material.</h1>
      <p className="form-intro">
        Upload notes, assignments or lecture content and let Learnify AI organize the learning path.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>Material title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Data Structures — Unit 1"
        />
      </div>

      <div className="field">
        <label>File</label>
        <div className="upload-drop">
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <p className="muted">PDF, DOCX or TXT · max 10 MB</p>
        </div>
      </div>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Processing your material..." : "Upload & build my lessons →"}
      </button>
    </form>
  );
}
