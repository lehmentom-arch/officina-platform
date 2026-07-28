"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | forgot
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    if (error) { setError(error.message); return; }
    setResetSent(true);
  };

  return (
    <div className="container" style={{ padding: "48px 32px" }}>
      <div className="panel" style={{ maxWidth: 400 }}>
        {mode === "login" ? (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 18 }}>Anmelden</h1>
            <form onSubmit={submit}>
              <div className="field">E-Mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field">Passwort<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginBottom: 12 }}>{loading ? "…" : "Login"}</button>
            </form>
            <button onClick={() => setMode("forgot")} style={{ background: "none", border: "none", color: "var(--amber)", fontSize: 13, padding: 0 }}>Passwort vergessen?</button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 18 }}>Passwort zurücksetzen</h1>
            {resetSent ? (
              <p style={{ fontSize: 14 }}>Falls die Adresse registriert ist, haben wir dir einen Link zum Zurücksetzen gesendet.</p>
            ) : (
              <form onSubmit={sendReset}>
                <div className="field">E-Mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
                <button className="btn-primary" type="submit">Link senden</button>
              </form>
            )}
            <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 13, padding: 0, marginTop: 12 }}>← zurück zum Login</button>
          </>
        )}
      </div>
    </div>
  );
}
