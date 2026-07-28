"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function EmployerDashboard() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    const { data: comp } = await supabase.from("companies").select("*").eq("owner_id", session.user.id).maybeSingle();
    if (!comp) { router.push("/employer/company"); return; }
    setCompany(comp);

    const { data: jobList } = await supabase.from("jobs").select("*").eq("company_id", comp.id).order("created_at", { ascending: false });
    setJobs(jobList || []);

    const { data: apps } = await supabase.from("applications").select("job_id").in("job_id", (jobList || []).map((j) => j.id));
    const counts = {};
    (apps || []).forEach((a) => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
    setAppCounts(counts);
    setLoading(false);
  }

  if (loading) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  const totalApps = Object.values(appCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>{company.name}</h1>
      <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>{company.place} ({company.canton})</div>

      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <div className="panel" style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 26, fontWeight: 600 }}>{jobs.length}</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Inserate</div>
        </div>
        <div className="panel" style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 26, fontWeight: 600 }}>{jobs.filter((j) => j.status === "published").length}</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Veröffentlicht</div>
        </div>
        <div className="panel" style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 26, fontWeight: 600 }}>{totalApps}</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Bewerbungen gesamt</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <Link href="/employer/jobs/new" className="btn-primary" style={{ textDecoration: "none" }}>+ Stelle erstellen</Link>
        <Link href="/employer/company" className="btn-ghost" style={{ textDecoration: "none" }}>Firmenprofil bearbeiten</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map((job) => (
          <div key={job.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 17, fontFamily: "'Fraunces', serif" }}>{job.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                Status: {job.status === "published" ? "Veröffentlicht" : job.status === "pending" ? "Wartet auf Freischaltung" : "Geschlossen"} · {appCounts[job.id] || 0} Bewerbung(en)
              </div>
            </div>
            <Link href={`/employer/applications?job=${job.id}`} className="btn-ghost" style={{ textDecoration: "none" }}>Bewerbungen ansehen</Link>
          </div>
        ))}
        {jobs.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Noch keine Inserate. Erstelle deine erste Stelle.</div>}
      </div>
    </div>
  );
}
