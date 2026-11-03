import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await signUp(form);
      else await signIn({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-aside">
        <div className="auth-brand"><span className="brand-mark">S</span> SprintBoard</div>
        <div className="auth-message">
          <span className="eyebrow">A CLEARER WAY TO WORK</span>
          <h1>Good work happens when everyone knows what’s next.</h1>
          <p>Keep projects moving, make priorities visible, and give the small details a place to land.</p>
          <div className="auth-note">A calmer home for your team's work.</div>
        </div>
        <span className="auth-copyright">SprintBoard · Project workspace</span>
      </div>
      <div className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">{isRegister ? "GET STARTED" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Create your account" : "Sign in to SprintBoard"}</h2>
          <p className="muted">{isRegister ? "Set up your workspace in a moment." : "Pick up where you left off."}</p>
          {isRegister && <label>Your name<input name="name" value={form.name} onChange={update} minLength="2" maxLength="60" required placeholder="e.g. Aman Jangid" /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} required minLength="8" maxLength="72" autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
          <p className="auth-switch">{isRegister ? "Already have an account?" : "New to SprintBoard?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        </form>
      </div>
    </div>
  );
}
