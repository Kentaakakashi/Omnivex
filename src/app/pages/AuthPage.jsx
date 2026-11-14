import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../providers/AuthProvider.jsx";
import { useToast } from "../providers/ToastProvider.jsx";

export default function AuthPage() {
  const { configured, user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async event => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const result = await signUp(email.trim(), password, displayName.trim());
        if (!result.session) {
          showToast({ title: "Check your email", description: "Supabase requires email confirmation before the first sign-in." });
          setMode("sign-in");
        } else {
          navigate(location.state?.from?.pathname || "/me", { replace: true });
        }
      } else {
        await signIn(email.trim(), password);
        navigate(location.state?.from?.pathname || "/me", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = async () => {
    setError("");
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || "Google sign-in is unavailable right now.");
      setGoogleBusy(false);
    }
  };

  if (loading) return <section className="auth-screen"><p>Restoring your session…</p></section>;
  if (user) return (
    <section className="auth-screen">
      <div className="auth-panel">
        <span className="section-kicker">ACCOUNT CONNECTED</span>
        <h1>You're in the atlas.</h1>
        <p>Signed in as <strong>{user.email}</strong>.</p>
        <Link className="atlas-button atlas-button--dark" to="/me">Open your space <ArrowUpRight size={16} /></Link>
      </div>
    </section>
  );

  return (
    <section className="auth-screen">
      <div className="auth-panel">
        <Link to="/" className="auth-back"><ArrowLeft size={15} /> Back to OMNIVEX</Link>
        <span className="section-kicker"><ShieldCheck size={14} /> YOUR ACCOUNT · YOUR CONTRIBUTIONS</span>
        <h1>{mode === "sign-up" ? "Join the atlas." : "Return to the atlas."}</h1>
        <p className="auth-lead">Save research, follow entities, take part in evidence-led discussions and keep your notes private.</p>
        {!configured ? (
          <div className="auth-setup-warning">
            <strong>Supabase key still needs to be added.</strong>
            <p>The project URL is configured in the app. Add the project's publishable key as <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in the Netlify site environment variables, then redeploy.</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            {mode === "sign-up" && (
              <label>Display name
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={40} autoComplete="name" placeholder="How should we call you?" />
              </label>
            )}
            <label>Email address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
            </label>
            <label>Password
              <span className="auth-password">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </span>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="atlas-button atlas-button--dark auth-submit" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"} <ArrowUpRight size={16} />
            </button>
            <p className="auth-terms">By continuing, you agree to use the community respectfully and cite sources for factual claims.</p>
          </form>
        )}
        {configured && <div className="auth-google-wrap">
          <div className="auth-google-divider"><span>OR CONTINUE WITH</span></div>
          <button className="auth-google" type="button" onClick={continueWithGoogle} disabled={googleBusy || busy}>
            <span className="auth-google-mark" aria-hidden="true">G</span>
            {googleBusy ? "Connecting to Google…" : "Continue with Google"}
          </button>
        </div>}
        <button className="auth-switch" type="button" onClick={() => { setError(""); setMode(value => value === "sign-up" ? "sign-in" : "sign-up"); }}>
          {mode === "sign-up" ? "Already have an account? Sign in" : "New to OMNIVEX? Create an account"}
        </button>
      </div>
      <div className="auth-aside">
        <span>OMNIVEX × FIELD ATLAS</span>
        <strong>Explore widely.<br />Compare carefully.<br /><em>Follow the evidence.</em></strong>
        <small>Public contributions remain attributed. Private notes and saved items are scoped to your account.</small>
      </div>
    </section>
  );
}
