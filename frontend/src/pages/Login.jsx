import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({
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
    setLoading(true);

    try {
      const data = await loginUser(form);

      login(data);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(err.friendlyMessage || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <span className="eyebrow">WELCOME BACK</span>

      <h1>Log in to Learnify.</h1>

      <p className="form-intro">
        Continue your learning workspace.
      </p>

      {error && <div className="error">{error}</div>}

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
          required
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          placeholder="Your password"
        />
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log in →"}
      </button>

      <p className="muted">
        New here?{" "}
        <Link className="card-link" to="/register">
          Create your account
        </Link>
      </p>
    </form>
  );
}
