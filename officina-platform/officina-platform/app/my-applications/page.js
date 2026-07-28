"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const STATUS_LABELS = { new: "Neu", review: "In Prüfung", interview: "Interview", rejected: "Abgelehnt", hired: "Eingestellt" };

export default function MyApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const { data: list } = await supabase
        .from("applications")
        .select("*, jobs(title, place, canton, companies(name))")
        .eq("candidate_id", data.session.user.id)
        .order("created_at", { ascending: false });
      setApps(list || []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="container" style={{ padding: 48 }}>Lade…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Meine Bewerbungen</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {apps.map((a) => (
          <div key={a.id} className="panel" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>{a.jobs?.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>{a.jobs?.companies?.name} · {a.jobs?.place} ({a.jobs?.canton})</div>
              <span className="tag" style={{ marginTop: 8, display: "inline-block" }}>{STATUS_LABELS[a.status]}</span>
            </div>
            <a href={`/messages/${a.id}`} className="btn-ghost" style={{ textDecoration: "none", alignSelf: "center" }}>Nachrichten</a>
          </div>
        ))}
        {apps.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Noch keine Bewerbungen gesendet.</div>}
      </div>
    </div>
  );
}
