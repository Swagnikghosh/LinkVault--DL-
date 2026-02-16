import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from || "/";

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (mode === "signup") {
        await signup(name, email, password, confirmPassword);
      } else {
        await login(email, password);
      }
      navigate(destination, { replace: true });
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="layout-shell">
        <aside className="surface-card brand-pane">
          <span className="ambient-orb orb-left" />
          <span className="ambient-orb orb-right" />
          <div className="surface-card-inner space-y-4 stagger">
            <p className="kicker">Account Access</p>
            <h1 className="section-title">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
            <p className="section-subtitle">
              {mode === "signup"
                ? "Create your secure account to generate and manage private links."
                : "Log in to create links, edit expiry settings, and manage your vault."}
            </p>
            <div className="badge-row">
              <span className="badge-chip">HttpOnly cookie</span>
              <span className="badge-chip">Session validation</span>
              <span className="badge-chip">Per-user dashboard</span>
            </div>
          </div>
        </aside>

        <section className="surface-card form-pane">
          <form className="surface-card-inner space-y-4 stagger" onSubmit={submit}>
            <p className="kicker">{mode === "signup" ? "Sign Up" : "Log In"}</p>

            {mode === "signup" && (
              <div>
                <label className="field-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  className="field-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  className="field-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            </button>

            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => setMode((prev) => (prev === "signup" ? "login" : "signup"))}
            >
              {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
            </button>

            <p className="text-xs text-orange-100/75">Users with a shared link can still view content without logging in.</p>
          </form>
        </section>
      </div>
    </div>
  );
}
