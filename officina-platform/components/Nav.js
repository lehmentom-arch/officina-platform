"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function NavLink({ href, children, onClick }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        textDecoration: "none",
        fontSize: 14.5,
        fontWeight: 600,
        padding: "8px 4px",
        color: active ? "var(--amber)" : "#fff",
        borderBottom: active ? "2px solid var(--amber)" : "2px solid transparent",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "Jobs" },
    { href: "/profile", label: "Profil erstellen" },
    { href: "/pricing", label: "Preise" },
    { href: "/favorites", label: "Favoriten" },
    { href: "/alerts", label: "Job-Alarm" },
  ];
  if (role === "candidate") links.push({ href: "/my-applications", label: "Meine Bewerbungen" });
  if (role === "employer") links.push({ href: "/employer/dashboard", label: "Dashboard" });
  if (role === "admin") links.push({ href: "/admin", label: "Admin" });

  return (
    <header style={{ background: "var(--pine)", position: "sticky", top: 0, zIndex: 20 }}>
      <div className="container" style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 19, textDecoration: "none", color: "#fff", flexShrink: 0, letterSpacing: "-0.01em" }}>
          OFFICINA<span style={{ color: "var(--amber)" }}>.CH</span>
        </Link>

        <nav className="nav-desktop" style={{ display: "flex", gap: 22, flexWrap: "wrap", flex: 1, marginLeft: 24 }}>
          {links.map((l) => <NavLink key={l.href} href={l.href}>{l.label}</NavLink>)}
        </nav>

        <div className="nav-desktop" style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 13.5, opacity: 0.85 }}>DE</span>
          {session ? (
            <button onClick={logout} className="btn-primary">Abmelden</button>
          ) : (
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>Login</Link>
          )}
        </div>

        <button
          className="nav-mobile-toggle"
          aria-label="Menü öffnen"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ display: "none", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, width: 40, height: 40, cursor: "pointer", color: "#fff" }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile-panel" style={{ display: "none", flexDirection: "column", gap: 4, padding: "0 20px 20px" }}>
          {links.map((l) => <NavLink key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</NavLink>)}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {session ? (
              <button onClick={logout} className="btn-primary">Abmelden</button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-ghost" style={{ textDecoration: "none", borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>Login</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textDecoration: "none" }}>Registrieren</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; align-items: center; justify-content: center; }
          .nav-mobile-panel { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
