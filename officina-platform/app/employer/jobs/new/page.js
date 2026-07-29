"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { CANTONS } from "../../../../lib/cantons";

export default function NewJobPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsCompany, setNeedsCompany] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [form, setForm] = useState({
    title: "", profession: "apotheker", canton: "ZH", place: "",
    employment_type: "Festanstellung", description: "", is_springer: false, springer_duration: "",
  });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setNeedsLogin(true); setChecking(false); return; }
      const { data: comp } = await supabase.from("companies").select("id").eq("owner_id", data.session.user.id).maybeSingle();
      if (!comp) { setNeedsCompany(true); setChecking(false); return; }
      setCompanyId(comp.id);
      setChecking(false);
    });
  }, []);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const { error } = await supabase.from("jobs").insert({ ...form, company_id: companyId, status: "published" });
    setSaving(false);
    if (error) { setStatus(error.message); return; }
    router.push("/employer/dashboard");
  }

  if (checking) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  if (needsLogin) {
    return (
      <div className="container" style={{ padding: "40px 32px 80px" }}>
        <h1 style={{ fontSize: 22, marginBottom: 14 }}>Stelle inserieren</h1>
        <div className="panel" style={{ maxWidth: 460 }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>
            Um eine Stelle zu veröffentlichen, brauchst du ein Arbeitgeber-Konto. Melde dich an oder registriere dich in unter einer Minute.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/login" className="btn-ghost" style={{ textDecoration: "none" }}>Login</Link>
            <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>Konto erstellen</Link>
          </div>
        </div>
      </div>
    );
  }

  if (needsCompany) {
    return (
      <div className="container" style={{ padding: "40px 32px 80px" }}>
        <h1 style={{ fontSize: 22, marginBottom: 14 }}>Stelle inserieren</h1>
        <div className="panel" style={{ maxWidth: 460 }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Bevor du eine Stelle veröffentlichst, richte kurz dein Firmenprofil ein.</p>
          <Link href="/employer/company" className="btn-primary" style={{ textDecoration: "none" }}>Firmenprofil erstellen</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <div className="panel" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Stelle erstellen</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18 }}>
          Deine Stelle ist sofort nach dem Absenden auf der Startseite sichtbar.
        </p>
        <form onSubmit={submit}>
          <div className="field">Stellentitel<input required value={form.title} onChange={(e) => field("title", e.target.value)} placeholder="z. B. Pharma-Assistent:in 80%" /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              Rolle
              <select value={form.profession} onChange={(e) => field("profession", e.target.value)}>
                <option value="apotheker">Apotheker:in</option>
                <option value="pharma_assistent">Pharma-Assistent:in</option>
                <option value="praktikum">Praktikum</option>
              </select>
            </div>
            <div className="field" style={{ width: 160 }}>
              Kanton
              <select value={form.canton} onChange={(e) => field("canton", e.target.value)}>
                {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">Ort<input required value={form.place} onChange={(e) => field("place", e.target.value)} /></div>
          <div className="field">
            Anstellungsart
            <select value={form.employment_type} onChange={(e) => field("employment_type", e.target.value)}>
              <option>Festanstellung</option>
              <option>Teilzeit</option>
              <option>Praktikum</option>
            </select>
          </div>
          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" style={{ width: "auto" }} checked={form.is_springer} onChange={(e) => field("is_springer", e.target.checked)} />
            Kurzfristige Ferienvertretung (Springer)
          </div>
          {form.is_springer && (
            <div className="field">Dauer / Zeitraum<input value={form.springer_duration} onChange={(e) => field("springer_duration", e.target.value)} placeholder="z. B. 2 Wochen, August" /></div>
          )}
          <div className="field">Beschreibung<textarea rows={5} value={form.description} onChange={(e) => field("description", e.target.value)} /></div>
          {status && <div style={{ fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>{status}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Wird veröffentlicht…" : "Stelle veröffentlichen"}</button>
        </form>
      </div>
    </div>
  );
}
