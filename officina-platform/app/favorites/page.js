"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const { data: favs } = await supabase
        .from("favorites")
        .select("job_id, jobs(id, title, place, canton, companies(name))")
        .eq("candidate_id", data.session.user.id);
      setItems(favs || []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Favoriten</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((f) => f.jobs && (
          <Link key={f.job_id} href={`/jobs/${f.jobs.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="panel">
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{f.jobs.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>{f.jobs.companies?.name} · {f.jobs.place} ({f.jobs.canton})</div>
            </div>
          </Link>
        ))}
        {items.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Noch keine Favoriten gespeichert.</div>}
      </div>
    </div>
  );
}
