"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const PROFESSIONS = [
  { key: "all", label: "Alle Rollen" },
  { key: "apotheker", label: "Apotheker:in" },
  { key: "pharma_assistent", label: "Pharma-Assistent:in" },
  { key: "praktikum", label: "Praktikum" },
];

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [canton, setCanton] = useState("all");
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

  const cantons = ["all", ...Array.from(new Set(jobs.map((j) => j.canton).filter(Boolean)))];
  const filtered = jobs.filter((j) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${j.title} ${j.companies?.name} ${j.place}`.toLowerCase().includes(q);
    const matchesCanton = canton === "all" || j.canton === canton;
    const matchesProfession = profession === "all" || j.profession === profession;
    return matchesQuery && matchesCanton && matchesProfession;
  });

  return (
    <div className="container" style={{ padding: "36px 32px 80px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: "0.1em", color: "var(--amber)", marginBottom: 10, textTransform: "uppercase" }}>
        Karriereplattform · Apotheken Schweiz
      </div>
      <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", lineHeight: 1.1, marginBottom: 28, maxWidth: 620 }}>
        Die nächste Stelle in Ihrer Apotheke — sauber sortiert.
      </h1>

      <div className="panel" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Titel, Betrieb oder Ort suchen…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 2, minWidth: 180 }} />
        <select value={canton} onChange={(e) => setCanton(e.target.value)} style={{ flex: 1 }}>
          {cantons.map((c) => <option key={c} value={c}>{c === "all" ? "Alle Kantone" : c}</option>)}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article className="panel" style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ fontSize: 20, marginBottom: 4 }}>{job.title}</h3>
                  <div style={{ fontSize: 14, color: "#31463D", marginBottom: 8 }}>
                    {job.companies?.name} · {job.place} ({job.canton})
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="tag">{PROFESSIONS.find((p) => p.key === job.profession)?.label ?? job.profession}</span>
                    <span className="tag">{job.is_springer ? `Springer · ${job.springer_duration}` : job.employment_type}</span>
                    {job.companies?.verified && <span className="tag accent">✓ verifiziert</span>}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
