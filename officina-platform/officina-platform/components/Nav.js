"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function MenuLink({ href, children, onClick }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        textDecoration: "none",
        fontFamily: "'Fraunces', serif",
        fontSize: "clamp(22px, 4vw, 32px)",
        fontWeight: 600,
        color: active ? "var(--amber)" : "#F0F2EA",
        padding: "6px 0",
      }}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("DE");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); return; }
    supabase.from("profiles").select("role").eq("id", session.user.id).single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [session]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const logout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  };

  const close = () => setOpen(false);

  return (
    <>
      <header style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--pine)", zIndex: 20 }}>
        <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, textDecoration: "none", color: "#FFFFFF" }}>
          Officina<span style={{ color: "var(--amber)" }}>.ch</span>
        </Link>
        <button
          aria-label={open ? "Menü schliessen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6, width: 42, height: 42, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}
        >
          <span style={{ width: 20, height: 2, background: "#FFFFFF", display: "block", transform: open ? "rotate(45deg) translate(4px, 4px)" : "none", transition: "transform 0.2s" }} />
          <span style={{ width: 20, height: 2, background: "#FFFFFF", display: "block", opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ width: 20, height: 2, background: "#FFFFFF", display: "block", transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none", transition: "transform 0.2s" }} />
        </button>
      </header>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "var(--pine)", zIndex: 30, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" onClick={close} style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, textDecoration: "none", color: "#F0F2EA" }}>
              Officina<span style={{ color: "var(--amber)" }}>.ch</span>
            </Link>
            <button
              aria-label="Menü schliessen"
              onClick={close}
              style={{ background: "transparent", border: "1px solid #F0F2EA", borderRadius: 6, width: 42, height: 42, cursor: "pointer", color: "#F0F2EA", fontSize: 20 }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "20px 32px" }}>
            <MenuLink href="/" onClick={close}>Stellen</MenuLink>
            <MenuLink href="/employer/jobs/new" onClick={close}>Stelle inserieren</MenuLink>
            <MenuLink href="/profile" onClick={close}>Profil erstellen</MenuLink>
            <MenuLink href="/pricing" onClick={close}>Preise</MenuLink>
            <MenuLink href="/favorites" onClick={close}>Favoriten</MenuLink>
            <MenuLink href="/alerts" onClick={close}>Job-Alarm</MenuLink>
            {role === "candidate" && <MenuLink href="/my-applications" onClick={close}>Meine Bewerbungen</MenuLink>}
            {role === "employer" && <MenuLink href="/employer/dashboard" onClick={close}>Dashboard</MenuLink>}
            {role === "admin" && <MenuLink href="/admin" onClick={close}>Admin</MenuLink>}

            <div style={{ display: "flex", gap: 10, marginTop: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>
              {["DE", "FR", "IT", "EN"].map((l, i) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span style={{ color: "#5C7267" }}>|</span>}
                  <button
                    onClick={() => setLang(l)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: lang === l ? "var(--amber)" : "#D6DED4", fontWeight: lang === l ? 700 : 400, fontSize: 14, padding: 0 }}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px 32px 40px", display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {session ? (
              <>
                <Link href="/profile" onClick={close} className="btn-primary" style={{ textDecoration: "none", background: "var(--amber)" }}>Mein Profil</Link>
                <button onClick={logout} className="btn-ghost" style={{ borderColor: "#F0F2EA", color: "#F0F2EA" }}>Abmelden</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="btn-ghost" style={{ textDecoration: "none", borderColor: "#F0F2EA", color: "#F0F2EA" }}>Login</Link>
                <Link href="/register" onClick={close} className="btn-primary" style={{ textDecoration: "none", background: "var(--amber)" }}>Registrieren</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
