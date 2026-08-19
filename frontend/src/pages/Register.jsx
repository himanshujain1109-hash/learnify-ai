import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(form);

      login(data);

      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

      setError(err.friendlyMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <span className="eyebrow">START HERE</span>

      <h1>Create your workspace.</h1>

      <p className="form-intro">
        One account for your materials, lessons, quizzes and AI Tutor.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>Your name</label>

        <input
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Your name"
        />
      </div>

      <div className="field">
        <label>Email</label>

        <input
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label>Password</label>

        <input
          type="password"
          minLength="6"
          required
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          placeholder="At least 6 characters"
        />
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account →"}
      </button>

      <p className="muted">
        Already registered?{" "}
        <Link className="card-link" to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
