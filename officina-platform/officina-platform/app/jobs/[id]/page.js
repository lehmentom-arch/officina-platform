"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [session, setSession] = useState(null);
  const [applied, setApplied] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    load();
  }, [id]);

  async function load() {
    const { data } = await supabase
      .from("jobs")
      .select("*, companies(name, canton, place, description, verified)")
      .eq("id", id)
      .single();
    setJob(data);
  }

  async function apply() {
    if (!session) { router.push("/login"); return; }
    const { error } = await supabase.from("applications").insert({
      job_id: id,
      candidate_id: session.user.id,
      cover_note: note,
    });
    if (error) { setStatus(error.message); return; }
    setApplied(true);
  }

  async function toggleFavorite() {
    if (!session) { router.push("/login"); return; }
    await supabase.from("favorites").upsert({ candidate_id: session.user.id, job_id: id });
    setStatus("Zu Favoriten hinzugefügt.");
  }

  if (!job) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px", maxWidth: 720 }}>
      <div className="panel">
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>{job.title}</h1>
        <div style={{ fontSize: 15, color: "#31463D", marginBottom: 14 }}>
          {job.companies?.name} · {job.place} ({job.canton})
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <span className="tag">{job.employment_type}</span>
          {job.companies?.verified && <span className="tag accent">✓ verifizierter Betrieb</span>}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 24 }}>{job.description}</p>

        {applied ? (
          <div style={{ color: "var(--pine)", fontWeight: 600 }}>✓ Bewerbung gesendet</div>
        ) : (
          <>
            <div className="field">
              Kurze Nachricht an den Arbeitgeber (optional)
              <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={apply}>Mit einem Klick bewerben</button>
              <button className="btn-ghost" onClick={toggleFavorite}>☆ Favorit</button>
            </div>
          </>
        )}
        {status && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 10 }}>{status}</div>}
      </div>
    </div>
  );
}
