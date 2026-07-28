"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const CANTONS = ["ZH","BE","LU","UR","SZ","OW","NW","GL","ZG","FR","SO","BS","BL","SH","AR","AI","SG","GR","AG","TG","TI","VD","VS","NE","GE","JU"];

export default function CompanyPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [company, setCompany] = useState({ name: "", canton: "ZH", place: "", description: "" });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setSession(data.session);
      supabase.from("companies").select("*").eq("owner_id", data.session.user.id).maybeSingle()
        .then(({ data }) => { if (data) setCompany(data); });
    });
  }, [router]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const payload = { ...company, owner_id: session.user.id };
    const { error } = await supabase.from("companies").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) { setStatus(error.message); return; }
    router.push("/employer/dashboard");
  }

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <div className="panel" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 22, marginBottom: 18 }}>Firmenprofil</h1>
        <form onSubmit={save}>
          <div className="field">Name der Apotheke<input required value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>Ort<input value={company.place || ""} onChange={(e) => setCompany({ ...company, place: e.target.value })} /></div>
            <div className="field" style={{ width: 100 }}>
              Kanton
              <select value={company.canton} onChange={(e) => setCompany({ ...company, canton: e.target.value })}>
                {CANTONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field">Beschreibung<textarea rows={4} value={company.description || ""} onChange={(e) => setCompany({ ...company, description: e.target.value })} /></div>
          {status && <div style={{ fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>{status}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Speichert…" : "Speichern"}</button>
        </form>
      </div>
    </div>
  );
}
