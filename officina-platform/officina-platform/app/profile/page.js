"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const CANTONS = ["ZH","BE","LU","UR","SZ","OW","NW","GL","ZG","FR","SO","BS","BL","SH","AR","AI","SG","GR","AG","TG","TI","VD","VS","NE","GE","JU"];

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setSession(data.session);
      supabase.from("profiles").select("*").eq("id", data.session.user.id).single()
        .then(({ data }) => setProfile(data));
    });
  }, [router]);

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
                {CANTONS.map((c) => <option key={c}>{c}</option>)}
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
