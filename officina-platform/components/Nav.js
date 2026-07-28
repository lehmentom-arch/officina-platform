"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function NavButton({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        fontSize: 13.5,
        fontWeight: 600,
        padding: "8px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? "var(--pine)" : "var(--line)"}`,
        background: active ? "var(--pine)" : "transparent",
        color: active ? "var(--paper)" : "var(--pine)",
        whiteSpace: "nowrap",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

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

  return (
    <header style={{ borderBottom: "1px solid var(--line)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, background: "var(--paper)", zIndex: 10 }}>
      <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, textDecoration: "none", color: "var(--pine)" }}>
        Officina<span style={{ color: "var(--amber)" }}>.ch</span>
      </Link>
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <NavButton href="/">Stellen</NavButton>
        <NavButton href="/pricing">Preise</NavButton>
        <NavButton href="/favorites">Favoriten</NavButton>
        <NavButton href="/alerts">Job-Alarm</NavButton>
        {role === "candidate" && <NavButton href="/my-applications">Meine Bewerbungen</NavButton>}
        {role === "employer" && <NavButton href="/employer/dashboard">Dashboard</NavButton>}
        {role === "admin" && <NavButton href="/admin">Admin</NavButton>}
        {!session && <NavButton href="/employer/dashboard">Für Arbeitgeber</NavButton>}
      </nav>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {session ? (
          <>
            <Link href="/profile" className="btn-ghost" style={{ textDecoration: "none" }}>Mein Profil</Link>
            <button onClick={logout} className="btn-ghost">Abmelden</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost" style={{ textDecoration: "none" }}>Login</Link>
            <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>Registrieren</Link>
          </>
        )}
      </div>
    </header>
  );
}
