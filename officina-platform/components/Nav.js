"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

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
      <nav style={{ display: "flex", gap: 16, fontSize: 13.5, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/">Stellen</Link>
        <Link href="/pricing">Preise</Link>
        <Link href="/favorites">Favoriten</Link>
        <Link href="/alerts">Job-Alarm</Link>
        {role === "candidate" && <Link href="/my-applications">Meine Bewerbungen</Link>}
        {role === "employer" && <Link href="/employer/dashboard">Dashboard</Link>}
        {role === "admin" && <Link href="/admin">Admin</Link>}
        {!session && <Link href="/employer/dashboard">Für Arbeitgeber</Link>}
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
