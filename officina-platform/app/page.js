"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { CANTONS } from "../lib/cantons";

const PROFESSIONS = [
  { key: "all", label: "Alle Rollen" },
  { key: "apotheker", label: "Apotheker:in" },
  { key: "pharma_assistent", label: "Pharma-Assistent:in" },
  { key: "praktikum", label: "Praktikum" },
];

function SplitHero() {
  return (
    <div style={{ background: "var(--panel)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "56px 32px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 15, color: "var(--text2)", marginBottom: 4 }}>Ich suche</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.02em" }}>einen Job</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#jobs" className="btn-primary" style={{ textDecoration: "none" }}>Offene Stellen</a>
              <Link href="/profile" className="btn-ghost" style={{ textDecoration: "none", background: "#fff" }}>Profil erstellen</Link>
            </div>
          </div>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 15, color: "var(--text2)", marginBottom: 4 }}>Ich suche</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.02em" }}>Personal</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/employer/jobs/new" className="btn-primary" style={{ textDecoration: "none" }}>Inserat aufgeben</Link>
              <Link href="/pricing" className="btn-ghost" style={{ textDecoration: "none", background: "#fff" }}>Zugang & Preise</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 48 }}>Lade…</div>}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [canton, setCanton] = useState(searchParams.get("canton") || "all");
  const [profession, setProfession] = useState("all");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, profession, canton, place, employment_type, is_springer, springer_duration, created_at, companies(name, verified)")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  }

  const filtered = jobs.filter((j) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${j.title} ${j.companies?.name} ${j.place}`.toLowerCase().includes(q);
    const matchesCanton = canton === "all" || j.canton === canton;
    const matchesProfession = profession === "all" || j.profession === profession;
    return matchesQuery && matchesCanton && matchesProfession;
  });

  return (
    <div>
      <SplitHero />
      <div className="container" style={{ padding: "40px 32px 80px" }} id="jobs">
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>Neuste Stelleninserate</h2>
        <div style={{ width: 46, height: 3, background: "var(--amber)", marginBottom: 24 }} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <input placeholder="Titel, Betrieb oder Ort suchen…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 2, minWidth: 180 }} />
          <select value={canton} onChange={(e) => setCanton(e.target.value)} style={{ flex: 1 }}>
            <option value="all">Alle Kantone</option>
            {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <select value={profession} onChange={(e) => setProfession(e.target.value)} style={{ flex: 1 }}>
            {PROFESSIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ color: "var(--text2)" }}>Lade Stellen…</div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", color: "var(--text2)", borderStyle: "dashed" }}>
            Keine Stellen gefunden. Sobald Arbeitgeber Inserate veröffentlichen, erscheinen sie hier.
          </div>
        ) : (
          <div>
            {filtered.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="job-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "18px 4px", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text2)" }}>{job.companies?.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 13.5, color: "var(--text2)" }}>{job.place} ({job.canton})</span>
                    {job.companies?.verified && <span className="tag accent" style={{ fontSize: 11 }}>✓ verifiziert</span>}
                    <span style={{ color: "var(--amber)", fontWeight: 700 }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .job-row:hover { background: var(--panel); }
      `}</style>
    </div>
  );
}
