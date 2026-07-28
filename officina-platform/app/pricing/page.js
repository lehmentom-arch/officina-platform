const TIERS = [
  { name: "Standard", price: "290", period: "/ Inserat", features: ["1 aktives Inserat", "30 Tage Laufzeit", "Basis-Firmenprofil"] },
  { name: "Premium", price: "690", period: "/ Monat", features: ["Bis 5 aktive Inserate", "Hervorgehobenes Listing", "Bewerbungsverwaltung", "Zugriff auf Chat"], highlight: true },
  { name: "Pro", price: "1490", period: "/ Monat", features: ["Unbegrenzte Inserate", "Premium-Firmenprofil", "Zugriff auf Springer-Pool", "Statistiken", "Priorisierter Support"] },
];

export default function PricingPage() {
  return (
    <div className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 22 }}>Preise für Arbeitgeber</h1>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        {TIERS.map((tier) => (
          <div key={tier.name} className="panel" style={{
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
            <button className={tier.highlight ? "btn-primary" : "btn-ghost"} style={tier.highlight ? { background: "var(--amber)" } : {}}>Auswählen</button>
          </div>
        ))}
      </div>
    </div>
  );
}
