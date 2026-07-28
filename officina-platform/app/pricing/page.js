"use client";
import Link from "next/link";

export const TIERS = [
  { key: "standard", name: "Einzelinserat", price: "290", period: "Laufzeit: 9 Wochen", features: ["1 Inserat inklusive", "Laufzeit Inserat: 9 Wochen", "Bewerbungen im Dashboard"], access: "9 Wochen Zugang zur Datenbank" },
  { key: "premium", name: "Pro", price: "690", period: "Laufzeit: 1 Jahr", features: ["Bis zu 5 Inserate", "Hervorgehobenes Listing", "Chat mit Bewerbenden"], highlight: true, access: "12 Monate Zugang zur Datenbank" },
  { key: "pro", name: "Unlimited", price: "1490", period: "Laufzeit: 1 Jahr", features: ["Unbegrenzte Inserate", "Premium-Firmenprofil", "Zugriff auf Springer-Pool"], access: "12 Monate Zugang zur Datenbank" },
];

export default function PricingPage() {
  return (
    <div className="container" style={{ padding: "48px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Preise für Arbeitgeber</h1>
      <p style={{ fontSize: 14.5, color: "var(--text2)", marginBottom: 30 }}>Wähle das Paket, das zu deinem Personalbedarf passt.</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
        {TIERS.map((tier) => (
          <div key={tier.key} style={{
            flex: "1 1 260px",
            background: tier.highlight ? "var(--panel-highlight)" : "#fff",
            border: tier.highlight ? "1px solid #CBEBD1" : "1px solid var(--line)",
            borderRadius: 14, padding: 28, display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>{tier.name}</div>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text2)" }}>CHF </span>
              <span style={{ fontSize: 34, fontWeight: 800 }}>{tier.price}</span>
            </div>
            <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--text2)", marginBottom: 20 }}>{tier.period}</div>
            <Link
              href={`/pricing/${tier.key}`}
              className="btn-primary"
              style={{ textDecoration: "none", textAlign: "center", marginBottom: 24 }}
            >
              Auswählen
            </Link>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 14, flex: 1 }}>
              {tier.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>★</span>{f}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 18, paddingTop: 14, display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text2)" }}>
              <span>👥</span>{tier.access}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
