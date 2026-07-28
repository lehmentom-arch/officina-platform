"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const STATUS_LABELS = { new: "Neu", review: "In Prüfung", interview: "Interview", rejected: "Abgelehnt", hired: "Eingestellt" };

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 48 }}>Lade…</div>}>
      <ApplicationsInner />
    </Suspense>
  );
}

function ApplicationsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("job");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [jobId]);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    let query = supabase.from("applications").select("*, jobs(title), profiles(first_name, last_name, email, cv_url)").order("created_at", { ascending: false });
    if (jobId) query = query.eq("job_id", jobId);
    const { data } = await query;
    setApps(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("applications").update({ status }).eq("id", id);
    load();
  }

  if (loading) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Bewerbungen</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {apps.map((a) => (
          <div key={a.id} className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{a.profiles?.first_name} {a.profiles?.last_name}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{a.jobs?.title} · {a.profiles?.email}</div>
                {a.cover_note && <p style={{ fontSize: 13.5, marginTop: 8 }}>{a.cover_note}</p>}
                {a.profiles?.cv_url && <a href={a.profiles.cv_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Lebenslauf ansehen</a>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <a href={`/messages/${a.id}`} className="btn-ghost" style={{ textDecoration: "none" }}>Nachricht</a>
                <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        {apps.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Noch keine Bewerbungen.</div>}
      </div>
    </div>
  );
}
