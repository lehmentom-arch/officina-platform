"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tab, setTab] = useState("jobs");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const { data: me } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (me?.role !== "admin") { router.push("/"); return; }
    setAllowed(true);

    const { data: jobs } = await supabase.from("jobs").select("*, companies(name)").eq("status", "pending").order("created_at", { ascending: false });
    setPendingJobs(jobs || []);

    const { data: userList } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(userList || []);

    const { data: invoiceList } = await supabase.from("invoices").select("*, companies(name)").order("created_at", { ascending: false });
    setInvoices(invoiceList || []);
  }

  async function publish(id) {
    await supabase.from("jobs").update({ status: "published" }).eq("id", id);
    load();
  }
  async function reject(id) {
    await supabase.from("jobs").update({ status: "closed" }).eq("id", id);
    load();
  }
  async function setRole(id, role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  }

  if (!allowed) return <div className="container" style={{ padding: 48 }}>Prüfe Zugriff…</div>;

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Admin</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["jobs", "Inserate freischalten"], ["users", "Benutzer verwalten"], ["invoices", "Rechnungen"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn-primary" : "btn-ghost"}>{l}</button>
        ))}
      </div>

      {tab === "jobs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingJobs.map((j) => (
            <div key={j.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>{j.title}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{j.companies?.name} · {j.place} ({j.canton})</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => publish(j.id)}>Freischalten</button>
                <button className="btn-ghost" onClick={() => reject(j.id)}>Ablehnen</button>
              </div>
            </div>
          ))}
          {pendingJobs.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Keine Inserate zur Prüfung.</div>}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 14 }}>{u.first_name || "—"} {u.last_name || ""} · {u.email}</div>
              </div>
              <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                <option value="candidate">Bewerber:in</option>
                <option value="employer">Arbeitgeber</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "invoices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invoices.map((inv) => (
            <div key={inv.id} className="panel" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 14 }}>{inv.companies?.name} · Plan {inv.plan}</div>
              <div style={{ fontSize: 14 }}>CHF {inv.amount_chf} · {inv.status}</div>
            </div>
          ))}
          {invoices.length === 0 && <div className="panel" style={{ textAlign: "center", color: "var(--text2)" }}>Noch keine Rechnungen.</div>}
        </div>
      )}
    </div>
  );
}
