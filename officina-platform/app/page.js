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

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=2000&q=75",
  "https://images.unsplash.com/photo-1642055514517-7b52288890ec?auto=format&fit=crop&w=2000&q=75",
  "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?auto=format&fit=crop&w=2000&q=75",
  "https://images.unsplash.com/photo-1622230208995-0f26eba75875?auto=format&fit=crop&w=2000&q=75",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Guten Abend";
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

function Hero() {
  const [greet, setGreet] = useState("Guten Tag");
  useEffect(() => { setGreet(greeting()); }, []);

  return (
    <div style={{ position: "relative", marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw", overflow: "hidden", marginBottom: -56 }}>
      <div style={{ position: "relative", minHeight: 520, display: "flex", alignItems: "flex-end" }}>
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.15) 55%, rgba(15,23,42,0.55) 100%)" }} />
        <div className="container" style={{ position: "relative", padding: "100px 32px 130px", width: "100%" }}>
          <div style={{ display: "inline-block", fontSize: 15, color: "#fff", opacity: 0.95, marginBottom: 10, background: "rgba(15,23,42,0.35)", padding: "4px 12px", borderRadius: 20, backdropFilter: "blur(4px)" }}>{greet}.</div>
          <h1 style={{ fontSize: "clamp(32px, 5.5vw, 56px)", lineHeight: 1.05, marginBottom: 0, maxWidth: 720, color: "#fff", fontWeight: 800, letterSpacing: "-0.03em", textShadow: "0 2px 24px rgba(15,23,42,0.45)" }}>
            Die nächste Stelle in Ihrer Apotheke, die sich richtig anfühlt.
          </h1>
        </div>
      </div>

      <div className="container" style={{ position: "relative", padding: "0 32px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", transform: "translateY(-56px)" }}>
          <QuickAction href="#jobs" icon="↓" title="Stellen durchsuchen" subtitle="Alle offenen Positionen ansehen" />
          <QuickAction href="/employer/jobs/new" icon="+" title="Stelle inserieren" subtitle="Als Apotheke veröffentlichen" />
          <QuickAction href="/cantons" icon="⌖" title="Nach Kanton suchen" subtitle="Mit allen 26 Flaggen" />
        </div>
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

function QuickAction({ href, icon, title, subtitle }) {
  return (
    <a href={href} style={{
      flex: "1 1 220px", textDecoration: "none", color: "var(--pine)",
      background: "#fff", border: "1px solid var(--line)", borderRadius: 14,
      padding: "16px 18px", display: "flex", gap: 12, alignItems: "center",
      boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: "50%", background: "#F0FDF4", color: "var(--amber-dark)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, flexShrink: 0,
      }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>{subtitle}</div>
      </div>
    </a>
  );
}

function IconPeople() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--amber)" strokeWidth="1.6">
      <circle cx="22" cy="18" r="6" />
      <path d="M12 40c0-6 4.5-10 10-10s10 4 10 10" />
      <circle cx="38" cy="20" r="5" />
      <path d="M31 40c0.5-5 4-8.5 9-8.5" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--amber)" strokeWidth="1.6">
      <path d="M16 8h16l8 8v32a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" />
      <path d="M32 8v8h8" />
      <path d="M28 24v12M22 30h12" strokeLinecap="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--amber)" strokeWidth="1.6">
      <path d="M28 6 44 12v14c0 12-7 20-16 24-9-4-16-12-16-24V12Z" />
      <path d="M20 27l6 6 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhySection() {
  const items = [
    { Icon: IconPeople, text: "Arbeitgeber, die Officina.ch nutzen, können dich bei Interesse direkt kontaktieren. Das erhöht deine Chance, schnell die passende Stelle zu finden." },
    { Icon: IconDoc, text: "Für ein Profil solltest du Apotheker:in, Pharma-Assistent:in oder in einer verwandten Rolle im pharmazeutischen Umfeld tätig sein oder werden wollen." },
    { Icon: IconShield, text: "Officina.ch ist eine Schweizer Plattform, die Datenschutz ernst nimmt. Alle Daten werden in der Schweiz gespeichert und niemals an Dritte weitergegeben." },
  ];
  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {items.map(({ Icon, text }, i) => (
          <div key={i} style={{ flex: "1 1 240px" }}>
            <Icon />
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#31463D", marginTop: 14 }}>{text}</p>
          </div>
        ))}
      </div>
    </section>
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
      <Hero />
      <div className="container" style={{ padding: "40px 32px 80px" }}>
        <div id="jobs" style={{ position: "relative", top: -20 }} />
        <WhySection />
        <h2 style={{ fontSize: 24, marginBottom: 18 }}>Offene Stellen</h2>

      <div className="panel" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article className="job-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: "22px 24px", transition: "box-shadow 0.15s, transform 0.15s" }}>
                <div>
                  <h3 style={{ fontSize: 20, marginBottom: 4 }}>{job.title}</h3>
                  <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
                    {job.companies?.name} · {job.place} ({job.canton})
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="tag">{PROFESSIONS.find((p) => p.key === job.profession)?.label ?? job.profession}</span>
                    <span className="tag">{job.is_springer ? `Springer · ${job.springer_duration}` : job.employment_type}</span>
                    {job.companies?.verified && <span className="tag accent">✓ verifiziert</span>}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: "var(--amber)", flexShrink: 0 }}>→</span>
              </article>
            </Link>
          ))}
        </div>
      )}
      </div>
      <style>{`
        .job-card:hover { box-shadow: 0 12px 26px rgba(15,23,42,0.08); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
