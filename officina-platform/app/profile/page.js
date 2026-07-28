"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { CANTONS } from "../../lib/cantons";

function Step({ n, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{
        width: 26, height: 26, borderRadius: "50%", background: "var(--amber)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 14.5 }}>{children} <span style={{ color: "var(--amber)" }}>✓</span></span>
    </div>
  );
}

function ProfileIntro() {
  return (
    <div className="container" style={{ padding: "56px 32px 80px" }}>
      <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 380px" }}>
          <div style={{ color: "var(--amber-dark)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Jetzt Profil erstellen</div>
          <h1 style={{ fontSize: 32, marginBottom: 18, maxWidth: 460 }}>Hinterlege deinen Lebenslauf und werde von Apotheken gefunden.</h1>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, marginBottom: 14, maxWidth: 460 }}>
            Veröffentliche dein Profil kostenlos und erreiche Arbeitgeber, die gezielt nach Apotheker:innen und Pharma-Assistent:innen suchen.
          </p>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, marginBottom: 26, maxWidth: 460 }}>
            Du entscheidest selbst, wie viele Informationen du teilst — je vollständiger dein Profil, desto besser wirst du gefunden.
          </p>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>Profil erstellen</Link>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 34 }}>
            <Step n={1}>Kontaktdaten ausfüllen</Step>
            <Step n={2}>Rolle und Kanton angeben</Step>
            <Step n={3}>Lebenslauf hochladen (PDF)</Step>
          </div>
        </div>

        <div style={{ flex: "1 1 320px", maxWidth: 420 }}>
          <div className="panel" style={{ background: "var(--panel-highlight)", border: "1px solid #CBEBD1" }}>
            <div style={{ fontSize: 13, color: "var(--amber-dark)", fontWeight: 700, marginBottom: 12 }}>SO SIEHT DEIN PROFIL AUS</div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--line)", padding: 18 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--panel)", border: "1px solid var(--line)" }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Vorname Nachname</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>Apotheker:in · Zürich</div>
                </div>
              </div>
              {["Kontaktdaten", "Werdegang", "Dokumente"].map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                  <span>{s}</span><span style={{ color: "var(--amber)" }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [session, setSession] = useState(null);
  const [checked, setChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
      if (data.session) {
        supabase.from("profiles").select("*").eq("id", data.session.user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const field = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    let cv_url = profile.cv_url;
    if (cvFile) {
      const path = `${session.user.id}/${cvFile.name}`;
      const { error: uploadError } = await supabase.storage.from("resumes").upload(path, cvFile, { upsert: true });
      if (uploadError) { setStatus(uploadError.message); setSaving(false); return; }
      const { data: publicUrl } = supabase.storage.from("resumes").getPublicUrl(path);
      cv_url = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("profiles").update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      profession: profile.profession,
      canton: profile.canton,
      cv_url,
    }).eq("id", session.user.id);

    setSaving(false);
    if (error) { setStatus(error.message); return; }
    setStatus("Profil gespeichert.");
    setProfile((p) => ({ ...p, cv_url }));
  }

  if (!checked) return <div className="container" style={{ padding: 48 }}>Lade…</div>;
  if (!session) return <ProfileIntro />;
  if (!profile) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <div className="panel" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 22, marginBottom: 18 }}>Mein Profil</h1>
        <form onSubmit={save}>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>Vorname<input value={profile.first_name || ""} onChange={(e) => field("first_name", e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}>Nachname<input value={profile.last_name || ""} onChange={(e) => field("last_name", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              Rolle
              <select value={profile.profession || ""} onChange={(e) => field("profession", e.target.value)}>
                <option value="">—</option>
                <option value="apotheker">Apotheker:in</option>
                <option value="pharma_assistent">Pharma-Assistent:in</option>
                <option value="praktikum">Praktikum</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              Kanton
              <select value={profile.canton || ""} onChange={(e) => field("canton", e.target.value)}>
                <option value="">—</option>
                {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            Lebenslauf (PDF)
            <input type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files[0])} />
            {profile.cv_url && <a href={profile.cv_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Aktuellen Lebenslauf ansehen</a>}
          </div>
          {status && <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>{status}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Speichert…" : "Profil speichern"}</button>
        </form>
      </div>
    </div>
  );
}
