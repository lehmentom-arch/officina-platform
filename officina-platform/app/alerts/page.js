"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const CANTONS = ["ZH","BE","LU","UR","SZ","OW","NW","GL","ZG","FR","SO","BS","BL","SH","AR","AI","SG","GR","AG","TG","TI","VD","VS","NE","GE","JU"];

export default function AlertsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [canton, setCanton] = useState("ZH");
  const [profession, setProfession] = useState("apotheker");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setSession(data.session);
      load(data.session.user.id);
    });
  }, [router]);

  async function load(uid) {
    const { data } = await supabase.from("job_alerts").select("*").eq("candidate_id", uid);
    setAlerts(data || []);
  }

  async function create(e) {
    e.preventDefault();
    const { error } = await supabase.from("job_alerts").insert({ candidate_id: session.user.id, canton, profession });
    if (error) { setStatus(error.message); return; }
    setStatus("Job-Alarm gespeichert.");
    load(session.user.id);
  }

  async function remove(id) {
    await supabase.from("job_alerts").delete().eq("id", id);
    load(session.user.id);
  }

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Job-Alarm</h1>
      <p style={{ fontSize: 13.5, color: "var(--text2)", marginBottom: 20, maxWidth: 480 }}>
        Lege Kriterien fest — der Versand der E-Mail-Benachrichtigung selbst braucht noch eine
        geplante Supabase Edge Function (siehe README, „Nächste Schritte“).
      </p>
      <form onSubmit={create} className="panel" style={{ maxWidth: 420, display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} style={{ flex: 1 }}>
          {CANTONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={profession} onChange={(e) => setProfession(e.target.value)} style={{ flex: 1 }}>
          <option value="apotheker">Apotheker:in</option>
          <option value="pharma_assistent">Pharma-Assistent:in</option>
          <option value="praktikum">Praktikum</option>
        </select>
        <button className="btn-primary" type="submit">Alarm speichern</button>
      </form>
      {status && <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>{status}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map((a) => (
          <div key={a.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14 }}>{a.profession} · {a.canton}</div>
            <button className="btn-ghost" onClick={() => remove(a.id)}>Entfernen</button>
          </div>
        ))}
      </div>
    </div>
  );
}
