"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(role === "employer" ? "/employer/company" : "/profile");
  };

  return (
    <div className="container" style={{ padding: "48px 32px" }}>
      <div className="panel" style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, marginBottom: 18 }}>Registrieren</h1>
        <form onSubmit={submit}>
          <div className="field">
            Ich bin…
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="candidate">Bewerber:in</option>
              <option value="employer">Arbeitgeber</option>
            </select>
          </div>
          <div className="field">
            E-Mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.ch" />
          </div>
          <div className="field">
            Passwort
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mind. 6 Zeichen" />
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Wird erstellt…" : "Konto erstellen"}</button>
        </form>
      </div>
    </div>
  );
}
