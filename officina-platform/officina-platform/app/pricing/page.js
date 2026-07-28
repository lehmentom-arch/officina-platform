"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const TIERS = [
  { key: "standard", name: "Standard", price: "290", period: "/ Inserat", features: ["1 aktives Inserat", "30 Tage Laufzeit", "Basis-Firmenprofil"] },
  { key: "premium", name: "Premium", price: "690", period: "/ Monat", features: ["Bis 5 aktive Inserate", "Hervorgehobenes Listing", "Bewerbungsverwaltung", "Zugriff auf Chat"], highlight: true },
  { key: "pro", name: "Pro", price: "1490", period: "/ Monat", features: ["Unbegrenzte Inserate", "Premium-Firmenprofil", "Zugriff auf Springer-Pool", "Statistiken", "Priorisierter Support"] },
];

export default function PricingPage() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [loadingKey, setLoadingKey] = useState(null);

  async function selectPlan(tier) {
    setStatus(null);
    setLoadingKey(tier.key);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/register");
      return;
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", session.user.id)
      .maybeSingle();

    if (!company) {
      router.push("/employer/company");
      return;
    }

    const { error } = await supabase.from("invoices").insert({
      company_id: company.id,
      plan: tier.key,
      amount_chf: Number(tier.price),
      status: "open",
    });

    setLoadingKey(null);
    if (error) {
      setStatus(`Fehler: ${error.message}`);
      return;
    }
    setStatus(`Plan „${tier.name}" ausgewählt. Die Rechnung erscheint in deinem Dashboard — die Online-Zahlung folgt in einer späteren Version, aktuell kannst du bereits kostenlos Stellen inserieren.`);
  }

  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 22 }}>Preise für Arbeitgeber</h1>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
        {TIERS.map((tier) => (
          <div key={tier.key} className="panel" style={{
            flex: "1 1 240px",
            background: tier.highlight ? "var(--pine)" : "var(--panel)",
            color: tier.highlight ? "var(--paper)" : "var(--pine)",
          }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, marginBottom: 6 }}>{tier.name}</div>
            <div style={{ fontSize: 30, fontWeight: 600 }}>
              CHF {tier.price}<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.8 }}> {tier.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
              {tier.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <button
              onClick={() => selectPlan(tier)}
              disabled={loadingKey === tier.key}
              className={tier.highlight ? "btn-primary" : "btn-ghost"}
              style={tier.highlight ? { background: "var(--amber)" } : {}}
            >
              {loadingKey === tier.key ? "…" : "Auswählen"}
            </button>
          </div>
        ))}
      </div>
      {status && <div className="panel" style={{ fontSize: 14, color: "var(--pine)" }}>{status}</div>}
    </div>
  );
}
