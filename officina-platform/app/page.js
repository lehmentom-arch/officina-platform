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

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1642055514517-7b52288890ec?auto=format&fit=crop&w=2000&q=70",
  "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=2000&q=70",
  "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?auto=format&fit=crop&w=2000&q=70",
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=2000&q=70",
];

function Hero() {
  return (
    <div style={{ position: "relative", marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw", minHeight: 460, display: "flex", alignItems: "flex-end", overflow: "hidden", marginBottom: 32 }}>
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Apotheke"
          className="hero-bg-image"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            animationDelay: `${i * 6}s`,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,36,30,0.55) 0%, rgba(15,36,30,0.75) 55%, rgba(15,36,30,0.92) 100%)" }} />
      <div className="container" style={{ position: "relative", padding: "80px 32px 40px", width: "100%" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, letterSpacing: "0.14em", color: "var(--amber)", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>
          Karriereplattform · Apotheken Schweiz
        </div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.08, marginBottom: 0, maxWidth: 680, color: "#F5F7F1" }}>
          Die nächste Stelle in Ihrer Apotheke — sauber sortiert.
        </h1>
      </div>
      <style>{`
        .hero-bg-image {
          opacity: 0;
          animation: officina-hero-fade 24s infinite;
        }
        @keyframes officina-hero-fade {
          0% { opacity: 0; }
          4% { opacity: 1; }
          21% { opacity: 1; }
          25% { opacity: 0; }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-bg-image { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function FeatureList({ title, items }) {
  return (
    <div className="panel" style={{ flex: "1 1 260px" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 14, color: "var(--pine)" }}>{title}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5, color: "#31463D" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: "50%", background: "var(--pine)", color: "var(--paper)",
              fontSize: 12, flexShrink: 0,
            }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 24, marginBottom: 18 }}>Funktionen</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <FeatureList title="Bewerber" items={["Lebenslauf", "Job-Alarm", "Favoriten", "Chat", "Bewerben mit einem Klick"]} />
        <FeatureList title="Arbeitgeber" items={["Inserate", "Bewerber verwalten", "Nachrichten", "Statistiken", "Firmenprofil"]} />
      </div>
      <div className="panel" style={{ borderStyle: "dashed" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 14, color: "var(--pine)" }}>
          Version 2 <span style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)", verticalAlign: "middle", marginLeft: 8 }}>GEPLANT</span>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {["KI erstellt Stelleninserate", "KI bewertet Lebensläufe", "KI schlägt passende Kandidaten vor", "Video-Stellenanzeigen", "Gehaltsvergleich", "Arbeitgeberbewertungen"].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5, color: "var(--text2)" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: "50%", border: "1px solid var(--line)",
                fontSize: 11, flexShrink: 0,
              }}>◦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

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
    <div>
      <Hero />
      <div className="container" style={{ padding: "0 32px 80px" }}>
        <FeaturesSection />

        <h2 style={{ fontSize: 24, marginBottom: 18 }}>Offene Stellen</h2>

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
    </div>
  );
}
